import type { PermissionKey, PortalRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Effective permission for a user, checked against Postgres: their own
 * per-user override if one exists, else their role's default. Use this in
 * server actions — UI gating via RoleContext is only a convenience.
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
  return override?.granted ?? roleDefault?.granted ?? false;
}
