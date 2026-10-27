"use server";

import { revalidatePath } from "next/cache";
import {
  AttendanceCheckInMode,
  AttendanceStatus,
  AttendanceType,
  DocumentCategory,
  DocumentType,
  JobApplicationStatus,
  LeadPriority,
  LeadStatus,
  NotificationType,
  PortalRole,
  PropertyStatus,
  PropertyType,
  UserStatus,
} from "@prisma/client";
import pkg from "@/package.json";
import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/authz";
import { logActivity } from "@/lib/activityLog";
import { toCsv } from "@/lib/csv";
import { withTimeout } from "@/lib/withTimeout";
import { formatCurrency } from "@/lib/format";
import { COMPANY_NAME, COMPANY_PHONE_DISPLAY, PORTAL_CURRENCY, PORTAL_LOCALE, PORTAL_TIMEZONE } from "@/lib/constants";
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_BYTES } from "@/lib/passwordPolicy";
import { RATE_LIMIT_BUCKETS, rateLimitBackend, pingRateLimitBackend } from "@/lib/rateLimit";
import { emailConfigured, emailSender, emailUsingSandboxSender } from "@/lib/email";
import { getStorageUsage, pingStorage, storageConfigured, type StorageUsage } from "@/lib/storage";
import { getSystemSettings } from "@/lib/system-settings";
import { maintenanceFeatures } from "@/lib/maintenance";
import { ACCOUNT_CACHE_MS } from "@/auth";
import { SECURITY_MODULES, auditTimestamp } from "@/lib/auditLog";
import type { AuditEntry } from "@/lib/actions/systemAudit";

const DAY_MS = 86_400_000;

/** "FOLLOW_UP" → "Follow-up", "FOR_SALE" → "For Sale". */
function label(value: string): string {
  const overrides: Record<string, string> = { FOLLOW_UP: "Follow-up", PKS: "PKS", QR: "QR code", BUTTON: "Button" };
  if (overrides[value]) return overrides[value];
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const labels = (e: Record<string, string>) => Object.values(e).map(label);

// ─────────────────────────────────────────────────────────────────────────
// General & workflow — fixed in code or the schema, shown read-only
// ─────────────────────────────────────────────────────────────────────────

export type ReferenceGroup = { title: string; note?: string; values: string[] };

export type ReferenceData = {
  general: { label: string; value: string }[];
  groups: ReferenceGroup[];
};

export async function getReferenceDataAction(): Promise<ReferenceData> {
  await requireSystemAdmin();

  const now = new Date();
  const date = new Intl.DateTimeFormat(PORTAL_LOCALE, { dateStyle: "medium", timeZone: PORTAL_TIMEZONE });
  const dateTime = new Intl.DateTimeFormat(PORTAL_LOCALE, { dateStyle: "medium", timeStyle: "short", timeZone: PORTAL_TIMEZONE });

  return {
    general: [
      { label: "Company name", value: COMPANY_NAME },
      { label: "System name", value: `${COMPANY_NAME} Portal` },
      { label: "Contact number", value: COMPANY_PHONE_DISPLAY },
      { label: "Timezone", value: `${PORTAL_TIMEZONE} (now ${dateTime.format(now)})` },
      { label: "Locale and language", value: `${PORTAL_LOCALE} · English` },
      { label: "Currency", value: `${PORTAL_CURRENCY} · ${formatCurrency(1_250_000)}` },
      { label: "Date format", value: date.format(now) },
      { label: "Number format", value: new Intl.NumberFormat(PORTAL_LOCALE).format(1234567.89) },
    ],
    groups: [
      { title: "Listing statuses", values: labels(PropertyStatus) },
      { title: "Property types", values: labels(PropertyType) },
      { title: "Lead pipeline stages", note: "The columns on the Leads board, in order.", values: labels(LeadStatus) },
      { title: "Lead priorities", values: labels(LeadPriority) },
      {
        title: "Commission statuses",
        note: "Worked out from how much has been released against what was earned; they aren't stored.",
        values: ["In Review (nothing released)", "Pending (partly released)", "Paid (fully released)"],
      },
      { title: "Document categories", values: labels(DocumentCategory) },
      { title: "Document file types", values: labels(DocumentType) },
      { title: "Attendance statuses", values: labels(AttendanceStatus) },
      { title: "Attendance types and check-in modes", values: [...labels(AttendanceType), ...labels(AttendanceCheckInMode)] },
      { title: "Account (employee) statuses", note: "PENDING is the approval queue for new registrations.", values: labels(UserStatus) },
      { title: "Roles", values: labels(PortalRole) },
      { title: "Applicant statuses", values: labels(JobApplicationStatus) },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────

export type NotificationsOverview = {
  email: { configured: boolean; sender: string; sandbox: boolean };
  inApp: { unread: number; types: { label: string; last7Days: number; total: number }[] };
  formsOpen: boolean;
  alerts: { label: string; detail: string; channel: "In-app" | "Email"; active: boolean }[];
};

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  NEW_LEAD: "New lead",
  NEW_APPLICATION: "New job application",
  NEW_REGISTRATION: "New registration request",
};

export async function getNotificationsOverviewAction(): Promise<NotificationsOverview> {
  await requireSystemAdmin();

  const since = new Date(Date.now() - 7 * DAY_MS);
  const [totals, recent, unread, settings] = await Promise.all([
    prisma.notification.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.notification.groupBy({ by: ["type"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
    prisma.notification.count({ where: { read: false } }),
    getSystemSettings({ fresh: true }),
  ]);
  const totalBy = new Map(totals.map((t) => [t.type, t._count._all]));
  const recentBy = new Map(recent.map((t) => [t.type, t._count._all]));

  return {
    email: { configured: emailConfigured, sender: emailSender, sandbox: emailUsingSandboxSender },
    inApp: {
      unread,
      types: Object.entries(NOTIFICATION_TYPE_LABELS).map(([type, text]) => ({
        label: text,
        last7Days: recentBy.get(type as NotificationType) ?? 0,
        total: totalBy.get(type as NotificationType) ?? 0,
      })),
    },
    formsOpen: settings.inquiriesOpen,
    alerts: [
      { label: "New leads", detail: "Administrators, and the agent a lead was requested for.", channel: "In-app", active: true },
      { label: "Lead assignment", detail: "The agent a lead is assigned to.", channel: "In-app", active: true },
      { label: "Job applications", detail: "Administrators.", channel: "In-app", active: true },
      { label: "Registration requests", detail: "Administrators, for the approval queue.", channel: "In-app", active: true },
      { label: "New sign-in alert", detail: "The account owner, after each sign-in.", channel: "Email", active: emailConfigured },
      { label: "Invitations, verification and password resets", detail: "The person concerned.", channel: "Email", active: emailConfigured },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Security
// ─────────────────────────────────────────────────────────────────────────

export type SecurityOverview = {
  password: { minLength: number; maxBytes: number };
  session: { recheckSeconds: number; lifetimeDays: number };
  limits: { label: string; limit: number; minutes: number }[];
  limiter: "redis" | "memory";
  accounts: { active: number; pending: number; deactivated: number; rejected: number; administrators: number; systemAdmins: number };
  /** Active accounts, for forced sign-out. */
  users: { id: string; name: string; email: string; role: string; isSystemAdmin: boolean }[];
  currentUserId: string;
  events: AuditEntry[];
};

const LIMIT_LABELS: Record<keyof typeof RATE_LIMIT_BUCKETS, string> = {
  login: "Sign-in form, per visitor",
  credentialsIp: "Password check, per visitor",
  credentialsAccount: "Password check, per account",
  passwordChange: "Changing your password, per user",
  register: "Registration, per visitor",
  passwordReset: "Password reset email, per visitor",
  publicForm: "Public forms, per visitor",
};

export async function getSecurityOverviewAction(): Promise<SecurityOverview> {
  const me = await requireSystemAdmin();

  const [statusCounts, administrators, systemAdmins, users, events] = await Promise.all([
    prisma.user.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.count({ where: { role: "ADMINISTRATOR", status: "ACTIVE" } }),
    prisma.user.count({ where: { isSystemAdmin: true, status: "ACTIVE" } }),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      take: 500,
      select: { id: true, name: true, email: true, role: true, isSystemAdmin: true },
    }),
    prisma.activityLogEntry.findMany({
      where: { module: { in: [...SECURITY_MODULES] } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 15,
    }),
  ]);
  const by = (s: UserStatus) => statusCounts.find((c) => c.status === s)?._count._all ?? 0;

  return {
    password: { minLength: MIN_PASSWORD_LENGTH, maxBytes: MAX_PASSWORD_BYTES },
    // Auth.js's default JWT lifetime — auth.ts doesn't override it.
    session: { recheckSeconds: Math.round(ACCOUNT_CACHE_MS / 1000), lifetimeDays: 30 },
    limits: (Object.keys(RATE_LIMIT_BUCKETS) as (keyof typeof RATE_LIMIT_BUCKETS)[]).map((key) => ({
      label: LIMIT_LABELS[key],
      ...RATE_LIMIT_BUCKETS[key],
    })),
    limiter: rateLimitBackend,
    accounts: {
      active: by("ACTIVE"),
      pending: by("PENDING"),
      deactivated: by("DEACTIVATED"),
      rejected: by("REJECTED"),
      administrators,
      systemAdmins,
    },
    users,
    currentUserId: me.id,
    events: events.map((r) => ({
      id: r.id,
      user: r.userLabel,
      action: r.action,
      module: r.module,
      timestamp: auditTimestamp(r.createdAt),
      ip: r.ip ?? "—",
    })),
  };
}

export type ForceSignOutResult = { error?: string; success?: boolean; count?: number };

/**
 * Sessions are JWTs, so there is no session row to delete. What ends a session
 * is lib/sessionRefresh.ts: any token signed in before the account's
 * passwordChangedAt is rejected on its next account re-check (within
 * ACCOUNT_CACHE_MS). Stamping that field is therefore a real forced sign-out,
 * and it doesn't touch the password.
 */
export async function forceSignOutAction(userId: string): Promise<ForceSignOutResult> {
  const me = await requireSystemAdmin();

  if (typeof userId !== "string" || !userId) return { error: "Choose a user." };
  if (userId === me.id) return { error: "Use Log out to end your own session." };

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } });
  if (!target) return { error: "User not found." };

  await prisma.user.update({ where: { id: target.id }, data: { passwordChangedAt: new Date() } });
  await logActivity({
    userId: me.id,
    userLabel: me.name || me.email,
    action: `Forced sign-out of ${target.name}`,
    module: "Security",
  });

  revalidatePath("/portal/system");
  return { success: true, count: 1 };
}

/** Ends every other active account's sessions at once — for a suspected compromise. Your own session is kept. */
export async function forceSignOutOthersAction(): Promise<ForceSignOutResult> {
  const me = await requireSystemAdmin();

  const { count } = await prisma.user.updateMany({
    where: { status: "ACTIVE", id: { not: me.id } },
    data: { passwordChangedAt: new Date() },
  });
  await logActivity({
    userId: me.id,
    userLabel: me.name || me.email,
    action: `Forced sign-out of everyone else (${count} account${count === 1 ? "" : "s"})`,
    module: "Security",
  });

  revalidatePath("/portal/system");
  return { success: true, count };
}

// ─────────────────────────────────────────────────────────────────────────
// Data & exports
// ─────────────────────────────────────────────────────────────────────────

export type DataKind = "leads" | "applications" | "subscribers" | "users";

const EXPORT_LIMIT = 20_000;

const EXPORTS: Record<DataKind, { label: string; description: string }> = {
  leads: { label: "Leads", description: "Every inquiry and lead, with status, priority, source and assigned agent." },
  applications: { label: "Job applications", description: "Careers applicants and where each is in review." },
  subscribers: { label: "Newsletter subscribers", description: "Email addresses on the newsletter list." },
  users: { label: "Portal users", description: "Accounts, roles and statuses. Passwords are never included." },
};

export type DataOverview = {
  records: { label: string; count: number }[];
  exports: { kind: DataKind; label: string; description: string; count: number }[];
  limit: number;
};

export async function getDataOverviewAction(): Promise<DataOverview> {
  await requireSystemAdmin();

  const [leads, applications, subscribers, users, listings, documents, activity] = await Promise.all([
    prisma.lead.count(),
    prisma.jobApplication.count(),
    prisma.newsletterSubscriber.count(),
    prisma.user.count(),
    prisma.property.count(),
    prisma.documentFile.count(),
    prisma.activityLogEntry.count(),
  ]);
  const counts: Record<DataKind, number> = { leads, applications, subscribers, users };

  return {
    records: [
      { label: "Portal users", count: users },
      { label: "Listings", count: listings },
      { label: "Leads", count: leads },
      { label: "Documents", count: documents },
      { label: "Job applications", count: applications },
      { label: "Newsletter subscribers", count: subscribers },
      { label: "Activity log entries", count: activity },
    ],
    exports: (Object.keys(EXPORTS) as DataKind[]).map((kind) => ({ kind, ...EXPORTS[kind], count: counts[kind] })),
    limit: EXPORT_LIMIT,
  };
}

export type DataExport = { error?: string; csv?: string; filename?: string; count?: number; truncated?: boolean };

/** System Admin only: a CSV of one data set (capped), recorded in the activity log. */
export async function exportDataAction(kind: DataKind): Promise<DataExport> {
  const me = await requireSystemAdmin();

  if (typeof kind !== "string" || !Object.prototype.hasOwnProperty.call(EXPORTS, kind)) {
    return { error: "Unknown export." };
  }

  let csv: string;
  let count: number;
  let truncated: boolean;
  const take = EXPORT_LIMIT + 1;

  if (kind === "leads") {
    const rows = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take, include: { agent: { select: { name: true } } } });
    truncated = rows.length > EXPORT_LIMIT;
    const kept = rows.slice(0, EXPORT_LIMIT);
    count = kept.length;
    csv = toCsv(
      ["Created", "Name", "Email", "Phone", "Type", "Status", "Priority", "Source", "Property", "Assigned agent", "Message"],
      kept.map((l) => [l.createdAt, l.name, l.email, l.phone, l.type, label(l.status), label(l.priority), l.source, l.propertyLabel, l.agent?.name, l.message])
    );
  } else if (kind === "applications") {
    const rows = await prisma.jobApplication.findMany({ orderBy: { appliedAt: "desc" }, take });
    truncated = rows.length > EXPORT_LIMIT;
    const kept = rows.slice(0, EXPORT_LIMIT);
    count = kept.length;
    csv = toCsv(
      ["Applied", "Name", "Email", "Area of expertise", "Portfolio", "Status"],
      kept.map((a) => [a.appliedAt, a.name, a.email, a.positionInterest, a.portfolioUrl, label(a.status)])
    );
  } else if (kind === "subscribers") {
    const rows = await prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: "desc" }, take });
    truncated = rows.length > EXPORT_LIMIT;
    const kept = rows.slice(0, EXPORT_LIMIT);
    count = kept.length;
    csv = toCsv(["Subscribed", "Email"], kept.map((s) => [s.subscribedAt, s.email]));
  } else {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: { createdAt: true, name: true, email: true, role: true, status: true, phone: true, position: true, primaryOffice: true, isSystemAdmin: true, emailVerified: true },
    });
    truncated = rows.length > EXPORT_LIMIT;
    const kept = rows.slice(0, EXPORT_LIMIT);
    count = kept.length;
    csv = toCsv(
      ["Created", "Name", "Email", "Role", "Status", "Phone", "Position", "Office", "System Admin", "Email verified"],
      kept.map((u) => [u.createdAt, u.name, u.email, label(u.role), label(u.status), u.phone, u.position, u.primaryOffice, u.isSystemAdmin, u.emailVerified !== null])
    );
  }

  await logActivity({
    userId: me.id,
    userLabel: me.name || me.email,
    action: `Exported ${count} ${EXPORTS[kind].label.toLowerCase()}`,
    module: "Security",
  });

  const today = new Date().toLocaleDateString("en-CA", { timeZone: PORTAL_TIMEZONE });
  return { csv, filename: `${kind}-${today}.csv`, count, truncated };
}

// ─────────────────────────────────────────────────────────────────────────
// Integrations
// ─────────────────────────────────────────────────────────────────────────

export type IntegrationState = "connected" | "configured" | "not-configured" | "error" | "fallback" | "paused";

export type IntegrationRow = {
  name: string;
  purpose: string;
  state: IntegrationState;
  detail: string;
  hint?: string;
  ms?: number;
};

/** Runs a probe, capturing how long it took and why it failed, if it did. */
async function probe(run: () => Promise<unknown>, timeoutMs: number): Promise<{ ok: true; ms: number } | { ok: false; error: string }> {
  const started = Date.now();
  try {
    await withTimeout(run(), timeoutMs);
    return { ok: true, ms: Date.now() - started };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unreachable" };
  }
}

export async function getIntegrationsAction(): Promise<{ rows: IntegrationRow[]; checkedAt: string }> {
  await requireSystemAdmin();

  const since = new Date(Date.now() - 7 * DAY_MS);
  const [db, storage, limiter, settings, formLeads] = await Promise.all([
    probe(() => prisma.$queryRaw`SELECT 1`, 5_000),
    storageConfigured() ? probe(pingStorage, 6_000) : Promise.resolve(null),
    rateLimitBackend === "redis" ? probe(pingRateLimitBackend, 4_000) : Promise.resolve(null),
    getSystemSettings({ fresh: true }),
    prisma.lead.count({ where: { createdAt: { gte: since }, NOT: { source: "Manual Entry" } } }),
  ]);

  const rows: IntegrationRow[] = [
    db.ok
      ? { name: "Database", purpose: "PostgreSQL — every record in the portal.", state: "connected", detail: `Responding in ${db.ms} ms.`, ms: db.ms }
      : { name: "Database", purpose: "PostgreSQL — every record in the portal.", state: "error", detail: db.error },
    emailConfigured
      ? {
          name: "Email",
          purpose: "Resend — invitations, verification, password resets and sign-in alerts.",
          state: "configured",
          detail: `Sending as ${emailSender}.`,
          hint: emailUsingSandboxSender ? "Using Resend's shared sandbox sender. Set RESEND_FROM_EMAIL to a verified domain before relying on it." : undefined,
        }
      : {
          name: "Email",
          purpose: "Resend — invitations, verification, password resets and sign-in alerts.",
          state: "not-configured",
          detail: "RESEND_API_KEY isn't set, so emails are skipped.",
          hint: "Invite links are shown to the admin instead of being emailed.",
        },
    !storage
      ? {
          name: "File storage",
          purpose: "Cloudinary — documents, listing photos and profile pictures.",
          state: "not-configured",
          detail: "Cloudinary credentials aren't set, so uploads will fail.",
        }
      : storage.ok
        ? { name: "File storage", purpose: "Cloudinary — documents, listing photos and profile pictures.", state: "connected", detail: `Responding in ${storage.ms} ms.`, ms: storage.ms }
        : { name: "File storage", purpose: "Cloudinary — documents, listing photos and profile pictures.", state: "error", detail: storage.error },
    !limiter
      ? {
          name: "Rate limiting",
          purpose: "Upstash Redis — brute-force and spam protection.",
          state: "fallback",
          detail: "Using per-server in-memory limits.",
          hint: "On serverless hosting each instance counts separately, so limits are much weaker. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
        }
      : limiter.ok
        ? { name: "Rate limiting", purpose: "Upstash Redis — brute-force and spam protection.", state: "connected", detail: `Responding in ${limiter.ms} ms.`, ms: limiter.ms }
        : { name: "Rate limiting", purpose: "Upstash Redis — brute-force and spam protection.", state: "error", detail: limiter.error, hint: "Falling back to in-memory limits meanwhile." },
    process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      ? { name: "Bot protection", purpose: "Cloudflare Turnstile on the public forms.", state: "configured", detail: "CAPTCHA is checked on every public form." }
      : { name: "Bot protection", purpose: "Cloudflare Turnstile on the public forms.", state: "not-configured", detail: "Optional. The hidden-field and timing checks still run.", hint: "Add the Turnstile keys if bots keep getting through." },
    {
      name: "Website lead forms",
      purpose: "Contact, property and agent inquiries, applications and the newsletter.",
      state: settings.inquiriesOpen ? "connected" : "paused",
      detail: `${formLeads} inquir${formLeads === 1 ? "y" : "ies"} from the website in the last 7 days.`,
      hint: settings.inquiriesOpen ? undefined : "Forms are switched off under Controls, so visitors are asked to call instead.",
    },
    process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
      ? { name: "Sign-in", purpose: "Auth.js — signs and verifies session cookies.", state: "configured", detail: "A signing secret is set." }
      : { name: "Sign-in", purpose: "Auth.js — signs and verifies session cookies.", state: "error", detail: "No NEXTAUTH_SECRET or AUTH_SECRET is set." },
  ];

  return { rows, checkedAt: auditTimestamp(new Date()) };
}

// ─────────────────────────────────────────────────────────────────────────
// System health
// ─────────────────────────────────────────────────────────────────────────

export type HealthReport = {
  app: { version: string; commit: string | null; environment: string; node: string };
  database: { ok: boolean; latencyMs: number | null; sizeBytes: number | null; error?: string };
  storage: { documentBytes: number; documentCount: number; cloud: StorageUsage | null; cloudError?: string };
  offline: string[];
  lastEventAt: string | null;
  checkedAt: string;
};

export async function getHealthReportAction(): Promise<HealthReport> {
  await requireSystemAdmin();

  // One round trip does both jobs: if it answers, the database is reachable, and the answer is its size.
  const started = Date.now();
  let sizeBytes: number | null = null;
  let dbError: string | undefined;
  try {
    const rows = await withTimeout(
      prisma.$queryRaw<{ size: bigint }[]>`SELECT pg_database_size(current_database()) AS size`,
      5_000,
      "Database"
    );
    sizeBytes = rows[0] ? Number(rows[0].size) : null;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Unreachable";
  }
  const latencyMs = Date.now() - started;

  const [documents, lastEvent, settings, cloud] = await Promise.all([
    prisma.documentFile.aggregate({ _sum: { sizeBytes: true }, _count: { _all: true } }).catch(() => null),
    prisma.activityLogEntry.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }).catch(() => null),
    getSystemSettings({ fresh: true }),
    storageConfigured()
      ? withTimeout(getStorageUsage(), 6_000).then(
          (usage) => ({ usage, error: undefined as string | undefined }),
          (err: unknown) => ({ usage: null, error: err instanceof Error ? err.message : "Unreachable" })
        )
      : Promise.resolve({ usage: null, error: undefined as string | undefined }),
  ]);

  const offline: string[] = [];
  if (settings.publicMaintenance) offline.push("Public website");
  if (settings.portalMaintenance) offline.push("Entire portal");
  for (const f of maintenanceFeatures) if (settings.maintenanceFeatures.includes(f.key)) offline.push(f.label);

  return {
    app: {
      version: pkg.version,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      node: process.version,
    },
    database: dbError === undefined
      ? { ok: true, latencyMs, sizeBytes }
      : { ok: false, latencyMs: null, sizeBytes: null, error: dbError },
    storage: {
      documentBytes: documents?._sum.sizeBytes ?? 0,
      documentCount: documents?._count._all ?? 0,
      cloud: cloud.usage,
      cloudError: cloud.error,
    },
    offline,
    lastEventAt: lastEvent ? auditTimestamp(lastEvent.createdAt) : null,
    checkedAt: auditTimestamp(new Date()),
  };
}
