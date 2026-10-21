"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatAgentCode } from "@/lib/format";

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
  activityLogEntries: true,
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

/** Requires manage-users; throws if the caller isn't an Administrator. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMINISTRATOR") {
    throw new Error("Not authorized.");
  }
  return session;
}

export async function listPortalUsers(): Promise<AdminUserRow[]> {
  await requireAdmin();

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

export type SetListingResult = { error?: string; success?: boolean };

/**
 * Admin-only: lists or hides a person on the public website. Listing needs an
 * active account with a photo and bio so the public card never renders blank;
 * hiding always works.
 */
export async function setPublicListingAction(userId: string, listed: boolean): Promise<SetListingResult> {
  const session = await requireAdmin();

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

async function setStatus(userId: string, status: AdminUserRow["status"]) {
  const session = await requireAdmin();

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found.");

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
  const session = await requireAdmin();

  const unique = [...new Set(userIds)];
  if (unique.length === 0) return { error: "Select at least one user." };
  if (unique.length > MAX_BULK_USERS) return { error: `Select at most ${MAX_BULK_USERS} users at a time.` };

  const { count } = await prisma.user.updateMany({
    where: { id: { in: unique, not: session.user.id }, status: { in: BULK_FROM[status] } },
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
  const session = await requireAdmin();

  const unique = [...new Set(userIds)];
  if (unique.length === 0) return { error: "Select at least one account." };
  if (unique.length > MAX_BULK_USERS) return { error: `Select at most ${MAX_BULK_USERS} accounts at a time.` };

  const candidates = await prisma.user.findMany({
    where: {
      id: { in: unique, not: session.user.id },
      status: { in: ["DEACTIVATED", "REJECTED"] },
      isSystemAdmin: false,
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
