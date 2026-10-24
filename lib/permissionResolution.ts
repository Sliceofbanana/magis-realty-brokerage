import type { PermissionKey, PortalRole } from "@prisma/client";
import { defaultRolePermissions, permissionDefs } from "@/lib/data/permissions";
import type { PortalRole as RoleLabel } from "@/lib/types";

/**
 * The single rule for "does this person have this permission?", shared by the
 * server-side guards, the Permissions admin page and the client's
 * RoleContext so they can never disagree.
 *
 *   effective = per-user override ?? role default ?? built-in default
 *
 * Two safety rules sit on top:
 *  - Keys marked adminLocked (Manage Permissions) belong to Administrators
 *    alone: they always have it, and nobody else can, whatever the rows say.
 *    That stops an admin revoking everyone's way back in, and stops a stored
 *    override promoting a non-admin.
 *  - A missing role-default row falls back to the built-in matrix rather than
 *    to "denied", so a database that was never (re)seeded cannot lock the
 *    administrators out.
 */

const ROLE_LABEL: Record<PortalRole, RoleLabel> = {
  ADMINISTRATOR: "Administrator",
  BROKER: "Broker",
  AGENT: "Agent",
  MARKETING: "Marketing",
};

/** "manage-users" -> MANAGE_USERS */
export function toEnumKey(kebab: string): PermissionKey {
  return kebab.replace(/-/g, "_").toUpperCase() as PermissionKey;
}

const ADMIN_LOCKED = new Set(permissionDefs.filter((d) => d.adminLocked).map((d) => toEnumKey(d.key)));

export function isAdminLocked(permission: PermissionKey): boolean {
  return ADMIN_LOCKED.has(permission);
}

/** The built-in default for a role, used when the database has no row for it. */
export function builtInDefault(role: PortalRole, permission: PermissionKey): boolean {
  return defaultRolePermissions[ROLE_LABEL[role]].some((k) => toEnumKey(k) === permission);
}

export function resolvePermission(input: {
  role: PortalRole;
  permission: PermissionKey;
  /** The user's own override row, if any. */
  override?: boolean | null;
  /** The role-default row from the database, if any. */
  roleDefault?: boolean | null;
}): boolean {
  const { role, permission } = input;
  if (isAdminLocked(permission)) return role === "ADMINISTRATOR";
  return input.override ?? input.roleDefault ?? builtInDefault(role, permission);
}
