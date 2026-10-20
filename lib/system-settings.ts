import { prisma } from "@/lib/prisma";
import { defaultSystemSettings, sanitizeFeatures, type SystemSettingsValue } from "@/lib/maintenance";

/**
 * Reads the platform switches. Called on every request by the proxy, so it is
 * cached in memory for a few seconds per server instance (a change made by a
 * System Admin reaches every instance within TTL_MS) and it fails OPEN: if the
 * database is slow or unreachable the site stays up rather than locking
 * everyone out.
 */
const TTL_MS = 10_000;
const READ_TIMEOUT_MS = 1_500;

let cache: { at: number; value: SystemSettingsValue } | null = null;

type Row = {
  publicMaintenance: boolean;
  publicMessage: string | null;
  portalMaintenance: boolean;
  portalMessage: string | null;
  maintenanceFeatures: string[];
  featureMessage: string | null;
  registrationOpen: boolean;
  inquiriesOpen: boolean;
};

function fromRow(row: Row | null): SystemSettingsValue {
  if (!row) return defaultSystemSettings;
  return {
    publicMaintenance: row.publicMaintenance,
    publicMessage: row.publicMessage ?? "",
    portalMaintenance: row.portalMaintenance,
    portalMessage: row.portalMessage ?? "",
    maintenanceFeatures: sanitizeFeatures(row.maintenanceFeatures),
    featureMessage: row.featureMessage ?? "",
    registrationOpen: row.registrationOpen,
    inquiriesOpen: row.inquiriesOpen,
  };
}

export async function getSystemSettings(options: { fresh?: boolean } = {}): Promise<SystemSettingsValue> {
  if (!options.fresh && cache && Date.now() - cache.at < TTL_MS) return cache.value;

  try {
    const row = await Promise.race([
      prisma.systemSettings.findUnique({ where: { id: "singleton" } }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("settings read timed out")), READ_TIMEOUT_MS)),
    ]);
    cache = { at: Date.now(), value: fromRow(row) };
    return cache.value;
  } catch {
    // Fail open — keep serving the last known value, or the defaults (everything on).
    return cache?.value ?? defaultSystemSettings;
  }
}

/** Drops the in-memory copy so the next read hits the database (other instances catch up within TTL_MS). */
export function invalidateSystemSettings() {
  cache = null;
}

/** An error message when public forms are switched off, else null. */
export async function inquiriesClosedMessage(): Promise<string | null> {
  const s = await getSystemSettings();
  return s.inquiriesOpen ? null : "This form is temporarily unavailable. Please try again later or call our office.";
}
