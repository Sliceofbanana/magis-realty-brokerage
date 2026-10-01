"use server";

import { revalidatePath } from "next/cache";
import { PermissionKey } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/users";
import { permissionDefs } from "@/lib/data/permissions";
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
    const roleDefaults: Record<string, boolean> = {};
    for (const key of ALL_PERMISSIONS) {
      roleDefaults[key] = roleDefaultSet.has(key);
      permissions[key] = userOverrides?.get(key) ?? roleDefaults[key];
    }
    return { id: u.id, name: u.name, email: u.email, photo: u.photo, role: u.role, permissions, roleDefaults };
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

  revalidatePath("/portal/permissions");
  return { success: true };
}

function toPermissionEnumKey(key: string): PermissionKey {
  return key.replace(/-/g, "_").toUpperCase() as PermissionKey;
}

/**
 * The signed-in user's effective permission set (their own per-user override,
 * else their role's default) — backs RoleContext.hasPermission everywhere in
 * the portal. Without this, UI gating only ever reflects the static role
 * defaults in lib/data/permissions.ts, and per-user overrides set via the
 * Permissions admin page would have no actual effect anywhere.
 */
export async function getMyPermissionsAction(): Promise<Record<KebabPermissionKey, boolean>> {
  const empty = Object.fromEntries(permissionDefs.map((d) => [d.key, false])) as Record<
    KebabPermissionKey,
    boolean
  >;

  const session = await auth();
  if (!session?.user) return empty;

  const [roleDefaults, overrides] = await Promise.all([
    prisma.rolePermission.findMany({ where: { role: session.user.role, granted: true } }),
    prisma.userPermission.findMany({ where: { userId: session.user.id } }),
  ]);

  const roleDefaultSet = new Set(roleDefaults.map((r) => r.permission));
  const overrideMap = new Map(overrides.map((o) => [o.permission, o.granted]));

  const result = { ...empty };
  for (const def of permissionDefs) {
    const enumKey = toPermissionEnumKey(def.key);
    result[def.key] = overrideMap.get(enumKey) ?? roleDefaultSet.has(enumKey);
  }
  return result;
}
