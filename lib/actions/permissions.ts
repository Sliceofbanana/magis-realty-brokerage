"use server";

import { revalidatePath } from "next/cache";
import { PermissionKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/users";

export type UserPermissionRow = {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  role: string;
  permissions: Record<string, boolean>;
};

const ALL_PERMISSIONS = Object.values(PermissionKey);

/** Every active user with their effective permission set (per-user override, else their role's default). */
export async function listUserPermissions(): Promise<UserPermissionRow[]> {
  await requireAdmin();

  const [users, roleDefaults, overrides] = await Promise.all([
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, photo: true, role: true },
    }),
    prisma.rolePermission.findMany({ where: { granted: true } }),
    prisma.userPermission.findMany(),
  ]);

  const roleDefaultMap = new Map<string, Set<PermissionKey>>();
  for (const rp of roleDefaults) {
    const set = roleDefaultMap.get(rp.role) ?? new Set<PermissionKey>();
    set.add(rp.permission);
    roleDefaultMap.set(rp.role, set);
  }

  const overrideMap = new Map<string, Map<PermissionKey, boolean>>();
  for (const o of overrides) {
    const m = overrideMap.get(o.userId) ?? new Map<PermissionKey, boolean>();
    m.set(o.permission, o.granted);
    overrideMap.set(o.userId, m);
  }

  return users.map((u) => {
    const roleDefaultSet = roleDefaultMap.get(u.role) ?? new Set<PermissionKey>();
    const userOverrides = overrideMap.get(u.id);
    const permissions: Record<string, boolean> = {};
    for (const key of ALL_PERMISSIONS) {
      permissions[key] = userOverrides?.get(key) ?? roleDefaultSet.has(key);
    }
    return { id: u.id, name: u.name, email: u.email, photo: u.photo, role: u.role, permissions };
  });
}

export type SetPermissionResult = { error?: string; success?: boolean };

/** Admin-only: sets a per-user permission override. Administrators can't have Manage Permissions revoked. */
export async function setUserPermissionAction(
  userId: string,
  permission: PermissionKey,
  granted: boolean
): Promise<SetPermissionResult> {
  await requireAdmin();

  if (permission === PermissionKey.MANAGE_PERMISSIONS && !granted) {
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (target?.role === "ADMINISTRATOR") {
      return { error: "Administrators must always retain Manage Permissions." };
    }
  }

  await prisma.userPermission.upsert({
    where: { userId_permission: { userId, permission } },
    update: { granted },
    create: { userId, permission, granted },
  });

  revalidatePath("/portal/settings");
  return { success: true };
}
