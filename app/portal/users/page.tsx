"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, X as XIcon, UserX, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  listPortalUsers,
  approveUserAction,
  rejectUserAction,
  deactivateUserAction,
  reactivateUserAction,
  type AdminUserRow,
} from "@/lib/actions/users";

const adminRoleTone: Record<AdminUserRow["role"], "gold" | "blue" | "gray" | "navy"> = {
  ADMINISTRATOR: "gold",
  BROKER: "blue",
  AGENT: "gray",
  MARKETING: "navy",
};

const statusDisplay: Record<AdminUserRow["status"], { label: string; dot: string; text: string }> = {
  PENDING: { label: "Pending Approval", dot: "bg-amber-500", text: "text-amber-600" },
  ACTIVE: { label: "Active", dot: "bg-emerald-500", text: "text-emerald-600" },
  DEACTIVATED: { label: "Deactivated", dot: "bg-gray-300", text: "text-gray-400" },
  REJECTED: { label: "Rejected", dot: "bg-red-400", text: "text-red-500" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    listPortalUsers()
      .then(setUsers)
      .catch(() => setLoadError("Couldn't load users. You may need Administrator access."));
  }

  useEffect(load, []);

  function runAction(userId: string, action: (id: string) => Promise<void>) {
    setPendingId(userId);
    startTransition(async () => {
      await action(userId);
      load();
      setPendingId(null);
    });
  }

  const pendingCount = users?.filter((u) => u.status === "PENDING").length ?? 0;

  return (
    <div>
      <PageHeader title="Users" description="Approve new agent applications and manage platform accounts." />

      <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-6">
          <h2 className="font-serif text-lg font-bold text-navy-900">User Management</h2>
          {pendingCount > 0 && (
            <Badge tone="gold">
              {pendingCount} Pending Approval{pendingCount === 1 ? "" : "s"}
            </Badge>
          )}
        </div>

        {loadError && <p className="px-6 py-6 text-sm text-red-600">{loadError}</p>}

        {!loadError && !users && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">Loading users…</p>
        )}

        {users && users.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">No users yet.</p>
        )}

        {users && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3 font-medium">User Profile</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const status = statusDisplay[user.status];
                  const busy = isPending && pendingId === user.id;
                  return (
                    <tr key={user.id} className="border-t border-black/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.photo ?? undefined} initials={getInitials(user.name)} size={36} />
                          <div>
                            <p className="font-semibold text-navy-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={adminRoleTone[user.role]}>{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-sm ${status.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-3 text-gray-400">
                          {user.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                aria-label="Approve agent"
                                disabled={busy}
                                onClick={() => runAction(user.id, approveUserAction)}
                                className="text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                type="button"
                                aria-label="Reject application"
                                disabled={busy}
                                onClick={() => runAction(user.id, rejectUserAction)}
                                className="text-red-500 hover:text-red-600 disabled:opacity-40"
                              >
                                <XIcon size={16} />
                              </button>
                            </>
                          )}
                          {user.status === "ACTIVE" && (
                            <button
                              type="button"
                              aria-label="Deactivate user"
                              disabled={busy}
                              onClick={() => runAction(user.id, deactivateUserAction)}
                              className="hover:text-red-600 disabled:opacity-40"
                            >
                              <UserX size={15} />
                            </button>
                          )}
                          {(user.status === "DEACTIVATED" || user.status === "REJECTED") && (
                            <button
                              type="button"
                              aria-label="Reactivate user"
                              disabled={busy}
                              onClick={() => runAction(user.id, reactivateUserAction)}
                              className="text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
                            >
                              <UserCheck size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
