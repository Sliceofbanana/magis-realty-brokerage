"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, Search } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Toggle } from "@/components/ui/Toggle";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { permissionDefs } from "@/lib/data/permissions";
import type { PermissionKey } from "@prisma/client";
import {
  listUserPermissions,
  setUserPermissionAction,
  type UserPermissionRow,
} from "@/lib/actions/permissions";

const roleTone: Record<string, "gold" | "blue" | "gray" | "navy"> = {
  ADMINISTRATOR: "gold",
  BROKER: "blue",
  AGENT: "gray",
  MARKETING: "navy",
};

const roleOptions = ["ADMINISTRATOR", "BROKER", "AGENT", "MARKETING"];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function toPermissionEnumKey(key: string): PermissionKey {
  return key.replace(/-/g, "_").toUpperCase() as PermissionKey;
}

// Groups permissionDefs by category while preserving each def's original column order.
const categoryGroups = permissionDefs.reduce<{ category: string; defs: typeof permissionDefs }[]>(
  (groups, def) => {
    const group = groups.find((g) => g.category === def.category);
    if (group) group.defs.push(def);
    else groups.push({ category: def.category, defs: [def] });
    return groups;
  },
  []
);

export default function PermissionsAdminPage() {
  const [users, setUsers] = useState<UserPermissionRow[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ key: string; message: string } | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  function load() {
    listUserPermissions()
      .then(setUsers)
      .catch(() => setLoadError("Couldn't load permissions. You may need Administrator access."));
  }

  useEffect(load, []);

  const filteredUsers = useMemo(() => {
    if (!users) return null;
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  async function toggle(userId: string, permissionKey: string, next: boolean) {
    const cellKey = `${userId}:${permissionKey}`;
    setBusyKey(cellKey);
    setRowError(null);
    const result = await setUserPermissionAction(userId, toPermissionEnumKey(permissionKey), next);
    setBusyKey(null);
    if (result.error) {
      setRowError({ key: cellKey, message: result.error });
      return;
    }
    load();
  }

  return (
    <div>
      <PageHeader
        title="Permissions"
        description="What each active user can access across the portal. Toggle any permission on or off for an individual person — this overrides their role's default."
      />

      {users && users.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-lg border border-black/10 bg-white py-2 pl-9 pr-3 text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-navy-900 focus:outline-none"
          >
            <option value="">All Roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
        {loadError && <p className="px-6 py-6 text-sm text-red-600">{loadError}</p>}

        {!loadError && !users && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">Loading permissions…</p>
        )}

        {users && users.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">No active users yet.</p>
        )}

        {filteredUsers && users && users.length > 0 && filteredUsers.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">No users match your search.</p>
        )}

        {filteredUsers && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-gray-400">
                  <th className="sticky left-0 bg-white px-6 py-2" />
                  {categoryGroups.map((group) => (
                    <th
                      key={group.category}
                      colSpan={group.defs.length}
                      className="border-b border-black/5 px-3 py-2 text-center font-semibold text-navy-700"
                    >
                      {group.category}
                    </th>
                  ))}
                </tr>
                <tr className="text-xs uppercase tracking-wide text-gray-400">
                  <th className="sticky left-0 bg-white px-6 py-3 font-medium">User</th>
                  {permissionDefs.map((def) => (
                    <th key={def.key} className="px-3 py-3 text-center font-medium">
                      <span title={def.description}>{def.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-black/5">
                    <td className="sticky left-0 bg-white px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.photo ?? undefined} initials={getInitials(user.name)} size={32} />
                        <div>
                          <p className="font-semibold text-navy-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                          <Badge tone={roleTone[user.role] ?? "gray"} className="mt-1">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    {permissionDefs.map((def) => {
                      const cellKey = `${user.id}:${def.key}`;
                      const permKey = toPermissionEnumKey(def.key);
                      const granted = user.permissions[permKey] ?? false;
                      const isOverride = granted !== (user.roleDefaults[permKey] ?? false);
                      const locked = def.adminLocked && user.role === "ADMINISTRATOR";
                      return (
                        <td key={def.key} className="px-3 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <Toggle
                              checked={granted}
                              disabled={locked || busyKey === cellKey}
                              onChange={(v) => toggle(user.id, def.key, v)}
                              label={`${def.label} for ${user.name}`}
                            />
                            {isOverride && !locked && (
                              <span
                                className="text-[9px] font-semibold uppercase tracking-wide text-gold-600"
                                title="Differs from this user's role default"
                              >
                                Override
                              </span>
                            )}
                            {rowError?.key === cellKey && (
                              <p className="max-w-24 text-center text-[10px] leading-tight text-red-600">
                                {rowError.message}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-black/5 p-4 text-xs text-gray-400">
          <Lock size={12} className="mr-1 inline" />
          &ldquo;Manage Permissions&rdquo; is always retained by Administrators and cannot be revoked.
        </div>
      </div>
    </div>
  );
}
