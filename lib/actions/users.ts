"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  role: "ADMINISTRATOR" | "BROKER" | "AGENT" | "MARKETING";
  status: "PENDING" | "ACTIVE" | "DEACTIVATED" | "REJECTED";
  createdAt: string;
  /** Whether an administrator has listed this person on the public website. */
  publicListed: boolean;
  /** What's still missing before they can be listed (empty = ready). */
  listingMissing: string[];
};

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
      agentProfile: { select: { bio: true, publicListed: true } },
    },
  });

  return users.map(({ agentProfile, ...u }) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
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
