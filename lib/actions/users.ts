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
};

/** Requires manage-users; throws if the caller isn't an Administrator. */
async function requireAdmin() {
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
    select: { id: true, name: true, email: true, photo: true, role: true, status: true, createdAt: true },
  });

  return users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));
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
