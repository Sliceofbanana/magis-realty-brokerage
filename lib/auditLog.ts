import { PORTAL_LOCALE, PORTAL_TIMEZONE } from "@/lib/constants";

/**
 * Pure helpers for reading the activity log — no database or Next.js — so the
 * filter rules can be unit tested. The queries themselves live in
 * lib/actions/systemAudit.ts.
 */

export const AUDIT_PAGE_SIZE = 25;
/** Hard cap on one CSV export, so a click can't pull the whole table into memory. */
export const AUDIT_EXPORT_LIMIT = 10_000;

/** Modules whose entries make up the "Security events" view. */
export const SECURITY_MODULES = ["Security", "User Auth", "Permissions", "System"] as const;

export type AuditFilters = {
  /** Matches the action text or the person's name. */
  q?: string;
  module?: string;
  /** Inclusive calendar days in Manila time, "YYYY-MM-DD". */
  from?: string;
  to?: string;
  /** Limit to SECURITY_MODULES (ignored when a specific module is chosen). */
  securityOnly?: boolean;
  page?: number;
};

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/** Midnight at the start of a Manila calendar day, as an instant. Manila is UTC+8 all year. */
export function manilaDayStart(day: string): Date | null {
  if (!DAY.test(day)) return null;
  // Date.parse rolls "2026-02-30" over to March 2 instead of rejecting it, so check the day is real.
  const [y, m, d] = day.split("-").map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return new Date(`${day}T00:00:00+08:00`);
}

/** Prisma `where` for the activity log. Unknown or malformed inputs are ignored, never an error. */
export function buildAuditWhere(filters: AuditFilters) {
  const from = filters.from ? manilaDayStart(filters.from) : null;
  const to = filters.to ? manilaDayStart(filters.to) : null;
  const createdAt = {
    ...(from ? { gte: from } : {}),
    ...(to ? { lt: new Date(to.getTime() + DAY_MS) } : {}),
  };
  const q = filters.q?.trim().slice(0, 100);

  return {
    ...(filters.module
      ? { module: filters.module }
      : filters.securityOnly
        ? { module: { in: [...SECURITY_MODULES] } }
        : {}),
    ...(q
      ? {
          OR: [
            { action: { contains: q, mode: "insensitive" as const } },
            { userLabel: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(Object.keys(createdAt).length ? { createdAt } : {}),
  };
}

/** A 1-based page number within [1, pageCount]; garbage becomes page 1. */
export function clampPage(page: number | undefined, pageCount: number): number {
  const n = Number.isFinite(page) ? Math.trunc(page as number) : 1;
  return Math.min(Math.max(n, 1), Math.max(pageCount, 1));
}

const timestampFormatter = new Intl.DateTimeFormat(PORTAL_LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: PORTAL_TIMEZONE,
});

export function auditTimestamp(date: Date): string {
  return timestampFormatter.format(date);
}
