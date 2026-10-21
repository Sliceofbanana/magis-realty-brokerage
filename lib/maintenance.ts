/**
 * Maintenance-mode rules. Pure (no database, no Next.js) so they can be unit
 * tested and used from the request proxy, server actions, and the System page.
 */

export const maintenanceFeatures = [
  { key: "listings", label: "Listings", path: "/portal/listings" },
  { key: "leads", label: "Leads", path: "/portal/leads" },
  { key: "leaderboard", label: "Leaderboard", path: "/portal/leaderboard" },
  { key: "attendance", label: "Attendance", path: "/portal/attendance" },
  { key: "blogs", label: "Blogs", path: "/portal/blogs" },
  { key: "commissions", label: "Commissions", path: "/portal/commissions" },
  { key: "documents", label: "Documents", path: "/portal/documents" },
  { key: "teams", label: "Teams", path: "/portal/teams" },
  { key: "careers", label: "Careers", path: "/portal/careers" },
  { key: "users", label: "Users", path: "/portal/users" },
  { key: "permissions", label: "Permissions", path: "/portal/permissions" },
] as const;

export type MaintenanceFeatureKey = (typeof maintenanceFeatures)[number]["key"];

export const maintenanceFeatureKeys: string[] = maintenanceFeatures.map((f) => f.key);

export type SystemSettingsValue = {
  publicMaintenance: boolean;
  publicMessage: string;
  portalMaintenance: boolean;
  portalMessage: string;
  /** Feature keys currently under maintenance. */
  maintenanceFeatures: string[];
  featureMessage: string;
  registrationOpen: boolean;
  inquiriesOpen: boolean;
};

export const defaultSystemSettings: SystemSettingsValue = {
  publicMaintenance: false,
  publicMessage: "",
  portalMaintenance: false,
  portalMessage: "",
  maintenanceFeatures: [],
  featureMessage: "",
  registrationOpen: true,
  inquiriesOpen: true,
};

export const MESSAGE_MAX_LENGTH = 280;

/** Shown when a System Admin hasn't written a custom message. */
export const defaultMaintenanceMessages = {
  public: "We're making a few improvements and will be back shortly. Thank you for your patience.",
  portal: "The portal is temporarily offline for maintenance. Please check back soon.",
  feature: "This section is temporarily unavailable while we carry out maintenance.",
};

/**
 * Pages that keep working during public maintenance: the sign-in pages (so a System
 * Admin can still get in) and Request Access. Closing sign-ups is a separate switch
 * (registrationOpen), so applications can keep coming in while the website is down.
 */
const PUBLIC_EXEMPT = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/maintenance"];

const underPath = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

/** Which maintenance-able portal feature a path belongs to, if any. */
export function featureForPath(pathname: string): MaintenanceFeatureKey | null {
  return maintenanceFeatures.find((f) => underPath(pathname, f.path))?.key ?? null;
}

export type MaintenanceDecision = { kind: "allow" } | { kind: "rewrite"; to: string; status: 503 };

/**
 * What should happen to a request for `pathname`. System Admins are never
 * blocked — that's how they get in to turn maintenance back off.
 */
export function maintenanceDecision(
  pathname: string,
  settings: Pick<SystemSettingsValue, "publicMaintenance" | "portalMaintenance" | "maintenanceFeatures">,
  isSystemAdmin: boolean
): MaintenanceDecision {
  if (isSystemAdmin) return { kind: "allow" };
  if (underPath(pathname, "/maintenance") || underPath(pathname, "/portal/maintenance")) return { kind: "allow" };

  if (underPath(pathname, "/portal")) {
    if (settings.portalMaintenance) return { kind: "rewrite", to: "/maintenance?scope=portal", status: 503 };
    const feature = featureForPath(pathname);
    if (feature && settings.maintenanceFeatures.includes(feature)) {
      return { kind: "rewrite", to: `/portal/maintenance?feature=${feature}`, status: 503 };
    }
    return { kind: "allow" };
  }

  if (settings.publicMaintenance && !PUBLIC_EXEMPT.some((p) => underPath(pathname, p))) {
    return { kind: "rewrite", to: "/maintenance?scope=public", status: 503 };
  }
  return { kind: "allow" };
}

/** True when anything at all is switched off — used for the System Admin warning banner. */
export function anyMaintenanceActive(s: Pick<SystemSettingsValue, "publicMaintenance" | "portalMaintenance" | "maintenanceFeatures">) {
  return s.publicMaintenance || s.portalMaintenance || s.maintenanceFeatures.length > 0;
}

/** Keeps only known feature keys, without duplicates. */
export function sanitizeFeatures(keys: unknown): string[] {
  if (!Array.isArray(keys)) return [];
  return [...new Set(keys.filter((k): k is string => typeof k === "string" && maintenanceFeatureKeys.includes(k)))];
}
