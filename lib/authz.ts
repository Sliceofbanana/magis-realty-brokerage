import "server-only";
import type { PermissionKey } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userHasPermission } from "@/lib/permissions-server";

/**
 * Server-side guards for Server Actions and Server Components. These live
 * outside the "use server" action files on purpose: every export of a
 * "use server" file becomes a publicly callable endpoint.
 *
 * Both guards read role and status from the database rather than trusting the
 * sign-in token, and both throw "Not authorized." on failure.
 */

/**
 * Requires an ACTIVE user who holds `permission` — their own override if they
 * have one, else their role's default. This is the guard for anything that has
 * a permission key; the UI's hasPermission() is only a convenience on top.
 *
 * Returns the session with `user.role` set to the database's value.
 */
export async function requirePermission(permission: PermissionKey) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized.");

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });
  if (!account || account.status !== "ACTIVE") throw new Error("Not authorized.");
  if (!(await userHasPermission(session.user.id, account.role, permission))) throw new Error("Not authorized.");

  return { ...session, user: { ...session.user, role: account.role } };
}

/**
 * Requires an ACTIVE System Admin — the platform owner's tag, held by an
 * Administrator and granted on /portal/system. Checked against the database,
 * not the sign-in token, so a freshly tagged or untagged System Admin is
 * honoured immediately. Throws "Not authorized." otherwise.
 */
export async function requireSystemAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized.");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, isSystemAdmin: true, status: true },
  });
  if (!user || user.status !== "ACTIVE" || !user.isSystemAdmin) throw new Error("Not authorized.");
  return user;
}

/**
 * Requires an ACTIVE Administrator. For admin-only operations that have no
 * permission key (leads, careers, teams, meetings); everything with a key
 * goes through requirePermission instead.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized.");

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });
  if (!account || account.status !== "ACTIVE" || account.role !== "ADMINISTRATOR") {
    throw new Error("Not authorized.");
  }
  return session;
}
