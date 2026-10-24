"use server";

import { revalidatePath } from "next/cache";
import { PermissionKey } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { permissionDefs } from "@/lib/data/permissions";
import { isAdminLocked, resolvePermission, toEnumKey } from "@/lib/permissionResolution";
import type { PermissionKey as KebabPermissionKey } from "@/lib/types";

export type UserPermissionRow = {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  role: string;
  permissions: Record<string, boolean>;
  /** The user's role-default grants (before any per-user override) — lets the UI show which toggles are overrides. */
  roleDefaults: Record<string, boolean>;
};

const ALL_PERMISSIONS = Object.values(PermissionKey);

/** Every active user with their effective permission set (per-user override, else their role's default). */
export async function listUserPermissions(): Promise<UserPermissionRow[]> {
  await requirePermission("MANAGE_PERMISSIONS");

  const [users, roleRows, overrideRows] = await Promise.all([
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, photo: true, role: true },
    }),
    prisma.rolePermission.findMany(),
    prisma.userPermission.findMany(),
  ]);

  const roleRowMap = new Map(roleRows.map((r) => [`${r.role}:${r.permission}`, r.granted]));
  const overrideMap = new Map(overrideRows.map((o) => [`${o.userId}:${o.permission}`, o.granted]));

  return users.map((u) => {
    const permissions: Record<string, boolean> = {};
    const roleDefaults: Record<string, boolean> = {};
    for (const key of ALL_PERMISSIONS) {
      const roleDefault = roleRowMap.get(`${u.role}:${key}`);
      roleDefaults[key] = resolvePermission({ role: u.role, permission: key, roleDefault });
      permissions[key] = resolvePermission({
        role: u.role,
        permission: key,
        override: overrideMap.get(`${u.id}:${key}`),
        roleDefault,
      });
    }
    return { id: u.id, name: u.name, email: u.email, photo: u.photo, role: u.role, permissions, roleDefaults };
  });
}

export type SetPermissionResult = { error?: string; success?: boolean };

/** Sets a per-user permission override. Manage Permissions stays with Administrators alone. */
export async function setUserPermissionAction(
  userId: string,
  permission: PermissionKey,
  granted: boolean
): Promise<SetPermissionResult> {
  await requirePermission("MANAGE_PERMISSIONS");

  if (!ALL_PERMISSIONS.includes(permission) || typeof granted !== "boolean") {
    return { error: "Unknown permission." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) return { error: "User not found." };

  if (isAdminLocked(permission)) {
    if (target.role === "ADMINISTRATOR" && !granted) {
      return { error: "Administrators must always retain Manage Permissions." };
    }
    if (target.role !== "ADMINISTRATOR" && granted) {
      return { error: "Manage Permissions is reserved for Administrators." };
    }
  }

  await prisma.userPermission.upsert({
    where: { userId_permission: { userId, permission } },
    update: { granted },
    create: { userId, permission, granted },
  });

  revalidatePath("/portal/permissions");
  return { success: true };
}

/**
 * The signed-in user's effective permission set — backs RoleContext.hasPermission
 * everywhere in the portal. Uses the same resolver as the server-side guards
 * (lib/permissionResolution.ts), so what the UI shows is what the server enforces.
 */
export async function getMyPermissionsAction(): Promise<Record<KebabPermissionKey, boolean>> {
  const empty = Object.fromEntries(permissionDefs.map((d) => [d.key, false])) as Record<
    KebabPermissionKey,
    boolean
  >;

  const session = await auth();
  if (!session?.user) return empty;

  const [roleRows, overrides] = await Promise.all([
    prisma.rolePermission.findMany({ where: { role: session.user.role } }),
    prisma.userPermission.findMany({ where: { userId: session.user.id } }),
  ]);

  const roleMap = new Map(roleRows.map((r) => [r.permission, r.granted]));
  const overrideMap = new Map(overrides.map((o) => [o.permission, o.granted]));

  const result = { ...empty };
  for (const def of permissionDefs) {
    const permission = toEnumKey(def.key);
    result[def.key] = resolvePermission({
      role: session.user.role,
      permission,
      override: overrideMap.get(permission),
      roleDefault: roleMap.get(permission),
    });
  }
  return result;
}
