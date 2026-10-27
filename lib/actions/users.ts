"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { formatAgentCode } from "@/lib/format";
import { createToken } from "@/lib/tokens";
import { emailConfigured, inviteTemplate, sendEmail } from "@/lib/email";
import { getPublicBaseUrl } from "@/lib/url";
import { tooLong } from "@/lib/botSignals";
import { isValidEmail } from "@/lib/validation";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  role: "ADMINISTRATOR" | "BROKER" | "AGENT" | "MARKETING";
  status: "PENDING" | "ACTIVE" | "DEACTIVATED" | "REJECTED";
  createdAt: string;
  /** Permanent contact code shown next to listings, e.g. "AG-014". */
  agentCode: string;
  /** Whether an administrator has listed this person on the public website. */
  publicListed: boolean;
  /** What's still missing before they can be listed (empty = ready). */
  listingMissing: string[];
  /** Records tied to this account (listings, commissions, attendance, ...). 0 = safe to delete. */
  activityCount: number;
};

/** Every relation that means "this person did or owns something". Summed into activityCount. */
const ACTIVITY_COUNT_SELECT = {
  listedProperties: true,
  assignedLeads: true,
  authoredBlogPosts: true,
  commissionRecords: true,
  documents: true,
  agentQuotas: true,
  attendanceRecords: true,
  createdMeetings: true,
  badges: true,
  birthdayGreetingsReceived: true,
  birthdayGreetingsSent: true,
  birthdayReactions: true,
  // Sign-ins and other Security entries are history about the account, not work it owns:
  // they must not stop an archived account from being deleted.
  activityLogEntries: { where: { module: { not: "Security" } } },
} as const;

function sumCounts(counts: Record<string, number>) {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

function missingForListing(u: { photo: string | null; agentProfile: { bio: string[] } | null }) {
  const missing: string[] = [];
  if (!u.photo) missing.push("profile photo");
  if (!u.agentProfile || u.agentProfile.bio.length === 0) missing.push("bio");
  return missing;
}

export async function listPortalUsers(): Promise<AdminUserRow[]> {
  await requirePermission("MANAGE_USERS");

  const users = await prisma.user.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      role: true,
      status: true,
      createdAt: true,
      agentNo: true,
      agentProfile: { select: { bio: true, publicListed: true } },
      _count: { select: ACTIVITY_COUNT_SELECT },
    },
  });

  return users.map(({ agentProfile, agentNo, _count, ...u }) => ({
    ...u,
    activityCount: sumCounts(_count),
    createdAt: u.createdAt.toISOString(),
    agentCode: formatAgentCode(agentNo),
    publicListed: agentProfile?.publicListed ?? false,
    listingMissing: missingForListing({ photo: u.photo, agentProfile }),
  }));
}

const ROLE_LABELS: Record<AdminUserRow["role"], string> = {
  ADMINISTRATOR: "an Administrator",
  BROKER: "a Broker",
  AGENT: "an Agent",
  MARKETING: "Marketing",
};
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type CreateUserInput = {
  name: string;
  email: string;
  phone?: string;
  role: AdminUserRow["role"];
};

export type CreateUserResult = {
  error?: string;
  success?: boolean;
  /** True when the invite email went out. */
  emailed?: boolean;
  /** Set-password link, returned only when the email could not be sent so the admin can pass it on. */
  inviteLink?: string;
};

/**
 * Admin-only: creates an Active, email-verified account and invites the person
 * to choose their own password (the same single-use token flow as a password
 * reset, valid 7 days). The admin never sets or sees a password.
 */
export async function createUserAction(input: CreateUserInput): Promise<CreateUserResult> {
  const session = await requirePermission("MANAGE_USERS");

  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();

  if (!name || !email) return { error: "Name and email are required." };
  if (tooLong({ name, email, phone })) return { error: "One of the fields is too long." };
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };
  if (!(input.role in ROLE_LABELS)) return { error: "Select a role." };
  // Manage Users can be granted to non-admins; it must not be a route to becoming one.
  if (input.role === "ADMINISTRATOR" && session.user.role !== "ADMINISTRATOR") {
    return { error: "Only an Administrator can create Administrator accounts." };
  }

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return { error: "An account with this email already exists." };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || undefined,
      role: input.role,
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  await prisma.activityLogEntry.create({
    data: {
      userId: session.user.id,
      userLabel: session.user.name ?? session.user.email ?? "Unknown admin",
      action: `Created ${name}'s account (${input.role.toLowerCase()})`,
      module: "User Auth",
    },
  });

  const token = await createToken("password-reset", email, INVITE_TTL_MS);
  const link = `${await getPublicBaseUrl()}/reset-password?token=${token}`;
  const sent = await sendEmail({
    to: email,
    subject: "You've been added to Magis Realty & Brokerage",
    html: inviteTemplate(name, ROLE_LABELS[input.role], link),
  });

  revalidatePath("/portal/users");
  const emailed = emailConfigured && !sent.error;
  return emailed ? { success: true, emailed: true } : { success: true, emailed: false, inviteLink: link };
}

export type SetListingResult ={ error?: string; success?: boolean };

/**
 * Admin-only: lists or hides a person on the public website. Listing needs an
 * active account with a photo and bio so the public card never renders blank;
 * hiding always works.
 */
export async function setPublicListingAction(userId: string, listed: boolean): Promise<SetListingResult> {
  const session = await requirePermission("MANAGE_USERS");

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, status: true, photo: true, agentProfile: { select: { id: true, slug: true, bio: true } } },
  });
  if (!target) return { error: "User not found." };

  if (listed) {
    if (target.status !== "ACTIVE") return { error: "Only active accounts can be listed publicly." };
    const missing = missingForListing(target);
    if (missing.length > 0 || !target.agentProfile) {
      return { error: `${target.name} still needs a ${missing.join(" and ") || "bio"} before being listed.` };
    }
  } else if (!target.agentProfile) {
    return { success: true };
  }

  await prisma.agentProfile.update({
    where: { id: target.agentProfile!.id },
    data: { publicListed: listed },
  });

  await prisma.activityLogEntry.create({
    data: {
      userId: session.user.id,
      userLabel: session.user.name ?? session.user.email ?? "Unknown admin",
      action: `${listed ? "Listed" : "Hid"} ${target.name} on the public website`,
      module: "Agents",
    },
  });

  revalidatePath("/portal/users");
  revalidatePath("/agents");
  revalidatePath(`/agents/${target.agentProfile!.slug}`);
  return { success: true };
}

/**
 * Administrator and System Admin accounts can only be managed by an
 * Administrator, so holding Manage Users never lets someone act on — or
 * lock out — the people above them.
 */
function canManageTarget(actorRole: string, target: { role: string; isSystemAdmin: boolean }): boolean {
  return actorRole === "ADMINISTRATOR" || (target.role !== "ADMINISTRATOR" && !target.isSystemAdmin);
}

/** Prisma filter for the same rule, for the bulk actions. */
function manageableTargets(actorRole: string) {
  return actorRole === "ADMINISTRATOR" ? {} : { role: { not: "ADMINISTRATOR" as const }, isSystemAdmin: false };
}

async function setStatus(userId: string, status: AdminUserRow["status"]) {
  const session = await requirePermission("MANAGE_USERS");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found.");
  if (!canManageTarget(session.user.role, target)) throw new Error("Not authorized.");

  await prisma.user.update({ where: { id: userId }, data: { status } });

  await prisma.activityLogEntry.create({
    data: {
      userId: session.user.id,
      userLabel: session.user.name ?? session.user.email ?? "Unknown admin",
      action: `${statusVerb(status)} agent`,
      module: "User Auth",
    },
  });

  revalidatePath("/portal/settings");
}

function statusVerb(status: AdminUserRow["status"]) {
  switch (status) {
    case "ACTIVE":
      return "Approved";
    case "DEACTIVATED":
      return "Deactivated";
    case "REJECTED":
      return "Rejected";
    default:
      return "Updated";
  }
}

export type BulkUserStatusResult = { error?: string; changed?: number; skipped?: number };

const MAX_BULK_USERS = 100;

/** Which current statuses each bulk target may be applied to. */
const BULK_FROM: Record<"ACTIVE" | "DEACTIVATED" | "REJECTED", AdminUserRow["status"][]> = {
  REJECTED: ["PENDING"],
  DEACTIVATED: ["ACTIVE"],
  ACTIVE: ["DEACTIVATED", "REJECTED"],
};

/**
 * Admin-only bulk status change. Only valid transitions apply (reject = pending
 * applications, deactivate = active accounts, reactivate = archived accounts)
 * and the caller's own account is never touched; anything else is counted as
 * skipped.
 */
export async function bulkSetUserStatusAction(
  userIds: string[],
  status: "ACTIVE" | "DEACTIVATED" | "REJECTED"
): Promise<BulkUserStatusResult> {
  const session = await requirePermission("MANAGE_USERS");

  const unique = [...new Set(userIds)];
  if (unique.length === 0) return { error: "Select at least one user." };
  if (unique.length > MAX_BULK_USERS) return { error: `Select at most ${MAX_BULK_USERS} users at a time.` };

  const { count } = await prisma.user.updateMany({
    where: {
      id: { in: unique, not: session.user.id },
      status: { in: BULK_FROM[status] },
      ...manageableTargets(session.user.role),
    },
    data: { status },
  });

  if (count > 0) {
    await prisma.activityLogEntry.create({
      data: {
        userId: session.user.id,
        userLabel: session.user.name ?? session.user.email ?? "Unknown admin",
        action: `${status === "ACTIVE" ? "Reactivated" : statusVerb(status)} ${count} agent${count === 1 ? "" : "s"} in bulk`,
        module: "User Auth",
      },
    });
  }

  revalidatePath("/portal/users");
  revalidatePath("/portal/settings");
  return { changed: count, skipped: unique.length - count };
}

export type DeleteArchivedResult = { error?: string; deleted?: number; skipped?: number };

/**
 * Admin-only permanent delete of archived (deactivated / rejected) accounts that
 * have no activity at all. Accounts with any listing, lead, commission,
 * attendance, document, etc. are skipped, as is the caller's own account and
 * any System Admin. Sign-in rows, permission overrides, the agent profile and
 * notifications go with the account.
 */
export async function deleteArchivedUsersAction(userIds: string[]): Promise<DeleteArchivedResult> {
  const session = await requirePermission("MANAGE_USERS");

  const unique = [...new Set(userIds)];
  if (unique.length === 0) return { error: "Select at least one account." };
  if (unique.length > MAX_BULK_USERS) return { error: `Select at most ${MAX_BULK_USERS} accounts at a time.` };

  const candidates = await prisma.user.findMany({
    where: {
      id: { in: unique, not: session.user.id },
      status: { in: ["DEACTIVATED", "REJECTED"] },
      isSystemAdmin: false,
      ...(session.user.role === "ADMINISTRATOR" ? {} : { role: { not: "ADMINISTRATOR" as const } }),
    },
    select: { id: true, _count: { select: ACTIVITY_COUNT_SELECT } },
  });
  const deletable = candidates.filter((c) => sumCounts(c._count) === 0);

  let deleted = 0;
  for (const { id } of deletable) {
    try {
      await prisma.user.delete({ where: { id } });
      deleted++;
    } catch {
      // Activity appeared since we counted (foreign-key restrict): leave the account in place.
    }
  }

  if (deleted > 0) {
    await prisma.activityLogEntry.create({
      data: {
        userId: session.user.id,
        userLabel: session.user.name ?? session.user.email ?? "Unknown admin",
        action: `Permanently deleted ${deleted} archived account${deleted === 1 ? "" : "s"}`,
        module: "User Auth",
      },
    });
  }

  revalidatePath("/portal/users");
  revalidatePath("/portal/settings");
  return { deleted, skipped: unique.length - deleted };
}

export async function approveUserAction(userId: string) {
  await setStatus(userId, "ACTIVE");
}

export async function rejectUserAction(userId: string) {
  await setStatus(userId, "REJECTED");
}

export async function deactivateUserAction(userId: string) {
  await setStatus(userId, "DEACTIVATED");
}

export async function reactivateUserAction(userId: string) {
  await setStatus(userId, "ACTIVE");
}
