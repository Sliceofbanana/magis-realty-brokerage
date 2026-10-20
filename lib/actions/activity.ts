"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userHasPermission } from "@/lib/permissions-server";

export type ActivityRow = {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  ip: string;
};

export type ActivityLogResult = {
  entries: ActivityRow[];
  /** Total rows matching the filters (entries is capped at LIMIT). */
  total: number;
  modules: string[];
};

const LIMIT = 100;

const timestampFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

/** Recent activity from Postgres — requires Administrator or the View Activity Log permission. */
export async function listActivityLogAction(filters: { module?: string; action?: string } = {}): Promise<ActivityLogResult> {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized.");
  const allowed =
    session.user.role === "ADMINISTRATOR" ||
    (await userHasPermission(session.user.id, session.user.role, "VIEW_ACTIVITY_LOG"));
  if (!allowed) throw new Error("Not authorized.");

  const where = {
    ...(filters.module ? { module: filters.module } : {}),
    ...(filters.action ? { action: { contains: filters.action, mode: "insensitive" as const } } : {}),
  };

  const [rows, total, moduleRows] = await Promise.all([
    prisma.activityLogEntry.findMany({ where, orderBy: { createdAt: "desc" }, take: LIMIT }),
    prisma.activityLogEntry.count({ where }),
    prisma.activityLogEntry.findMany({ distinct: ["module"], select: { module: true }, orderBy: { module: "asc" } }),
  ]);

  return {
    entries: rows.map((r) => ({
      id: r.id,
      user: r.userLabel,
      action: r.action,
      module: r.module,
      timestamp: timestampFormatter.format(r.createdAt),
      ip: r.ip ?? "—",
    })),
    total,
    modules: moduleRows.map((m) => m.module),
  };
}
