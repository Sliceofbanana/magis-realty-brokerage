"use server";

import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { logActivity } from "@/lib/activityLog";
import { toCsv } from "@/lib/csv";
import { PORTAL_TIMEZONE } from "@/lib/constants";
import {
  AUDIT_EXPORT_LIMIT,
  AUDIT_PAGE_SIZE,
  auditTimestamp,
  buildAuditWhere,
  clampPage,
  type AuditFilters,
} from "@/lib/auditLog";

export type AuditEntry = {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  ip: string;
};

export type AuditPage = {
  entries: AuditEntry[];
  total: number;
  page: number;
  pageCount: number;
  /** Every module that has an entry, for the filter dropdown. */
  modules: string[];
};

/** The client is untrusted: keep only well-typed fields before they reach a query. */
function cleanFilters(raw: AuditFilters | undefined): AuditFilters {
  const f = raw ?? {};
  return {
    q: typeof f.q === "string" ? f.q : undefined,
    module: typeof f.module === "string" ? f.module : undefined,
    from: typeof f.from === "string" ? f.from : undefined,
    to: typeof f.to === "string" ? f.to : undefined,
    securityOnly: f.securityOnly === true,
    page: typeof f.page === "number" ? f.page : undefined,
  };
}

/** System Admin only: one page of the activity log, newest first. */
export async function listAuditLogAction(filters?: AuditFilters): Promise<AuditPage> {
  await requireSystemAdmin();

  const clean = cleanFilters(filters);
  const where = buildAuditWhere(clean);

  const [total, moduleRows] = await Promise.all([
    prisma.activityLogEntry.count({ where }),
    prisma.activityLogEntry.findMany({ distinct: ["module"], select: { module: true }, orderBy: { module: "asc" } }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));
  const page = clampPage(clean.page, pageCount);

  const rows = await prisma.activityLogEntry.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * AUDIT_PAGE_SIZE,
    take: AUDIT_PAGE_SIZE,
  });

  return {
    entries: rows.map((r) => ({
      id: r.id,
      user: r.userLabel,
      action: r.action,
      module: r.module,
      timestamp: auditTimestamp(r.createdAt),
      ip: r.ip ?? "—",
    })),
    total,
    page,
    pageCount,
    modules: moduleRows.map((m) => m.module),
  };
}

export type AuditExport = { csv: string; filename: string; count: number; truncated: boolean };

/** System Admin only: the entries matching the filters as a CSV (capped), recorded in the log itself. */
export async function exportAuditLogAction(filters?: AuditFilters): Promise<AuditExport> {
  const me = await requireSystemAdmin();

  const where = buildAuditWhere(cleanFilters(filters));
  const rows = await prisma.activityLogEntry.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: AUDIT_EXPORT_LIMIT + 1,
  });
  const truncated = rows.length > AUDIT_EXPORT_LIMIT;
  const kept = rows.slice(0, AUDIT_EXPORT_LIMIT);

  const csv = toCsv(
    ["Time (Manila)", "Time (UTC)", "User", "Action", "Module", "IP address"],
    kept.map((r) => [auditTimestamp(r.createdAt), r.createdAt, r.userLabel, r.action, r.module, r.ip])
  );

  await logActivity({
    userId: me.id,
    userLabel: me.name || me.email,
    action: `Exported ${kept.length} audit log entr${kept.length === 1 ? "y" : "ies"}`,
    module: "Security",
  });

  const today = new Date().toLocaleDateString("en-CA", { timeZone: PORTAL_TIMEZONE });
  return { csv, filename: `audit-log-${today}.csv`, count: kept.length, truncated };
}
