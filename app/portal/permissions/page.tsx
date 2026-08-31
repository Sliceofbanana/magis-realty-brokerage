"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Toggle } from "@/components/ui/Toggle";
import { Avatar } from "@/components/ui/Avatar";
import { permissionDefs } from "@/lib/data/permissions";
import type { PermissionKey } from "@prisma/client";
import {
  listUserPermissions,
  setUserPermissionAction,
  type UserPermissionRow,
} from "@/lib/actions/permissions";

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

export default function PermissionsAdminPage() {
  const [users, setUsers] = useState<UserPermissionRow[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ key: string; message: string } | null>(null);

  function load() {
    listUserPermissions()
      .then(setUsers)
      .catch(() => setLoadError("Couldn't load permissions. You may need Administrator access."));
  }

  useEffect(load, []);

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

      <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
        {loadError && <p className="px-6 py-6 text-sm text-red-600">{loadError}</p>}

        {!loadError && !users && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">Loading permissions…</p>
        )}

        {users && users.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">No active users yet.</p>
        )}

        {users && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
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
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-black/5">
                    <td className="sticky left-0 bg-white px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.photo ?? undefined} initials={getInitials(user.name)} size={32} />
                        <div>
                          <p className="font-semibold text-navy-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {permissionDefs.map((def) => {
                      const cellKey = `${user.id}:${def.key}`;
                      const granted = user.permissions[toPermissionEnumKey(def.key)] ?? false;
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
