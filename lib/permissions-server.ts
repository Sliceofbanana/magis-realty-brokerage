import type { PermissionKey, PortalRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolvePermission } from "@/lib/permissionResolution";

/**
 * Effective permission for a user, checked against Postgres: their own
 * per-user override if one exists, else their role's default (see
 * lib/permissionResolution.ts for the full rule). Prefer `requirePermission`
 * in lib/authz.ts for guarding an action — it also re-checks the account.
 */
export async function userHasPermission(
  userId: string,
  role: PortalRole,
  permission: PermissionKey
): Promise<boolean> {
  const [override, roleDefault] = await Promise.all([
    prisma.userPermission.findUnique({ where: { userId_permission: { userId, permission } } }),
    prisma.rolePermission.findUnique({ where: { role_permission: { role, permission } } }),
  ]);
  return resolvePermission({ role, permission, override: override?.granted, roleDefault: roleDefault?.granted });
}
