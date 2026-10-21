"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Archive, Check, X as XIcon, UserX } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { ArchivedAccountsModal } from "@/components/portal/ArchivedAccountsModal";
import { BulkActionBar, BulkActionButton } from "@/components/portal/BulkActionBar";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Checkbox } from "@/components/ui/Checkbox";
import { Toggle } from "@/components/ui/Toggle";
import { useRowSelection } from "@/lib/useRowSelection";
import {
  listPortalUsers,
  approveUserAction,
  rejectUserAction,
  deactivateUserAction,
  bulkSetUserStatusAction,
  setPublicListingAction,
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
  const [listingBusyId, setListingBusyId] = useState<string | null>(null);
  const [listingError, setListingError] = useState<{ id: string; message: string } | null>(null);

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

  async function toggleListing(userId: string, listed: boolean) {
    setListingBusyId(userId);
    setListingError(null);
    const result = await setPublicListingAction(userId, listed);
    setListingBusyId(null);
    if (result.error) {
      setListingError({ id: userId, message: result.error });
      return;
    }
    load();
  }

  const { data: session } = useSession();
  const selfId = session?.user?.id;
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [bulkPending, startBulk] = useTransition();
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  const liveUsers = useMemo(
    () => (users ?? []).filter((u) => u.status === "PENDING" || u.status === "ACTIVE"),
    [users]
  );
  const archivedUsers = useMemo(
    () => (users ?? []).filter((u) => u.status === "DEACTIVATED" || u.status === "REJECTED"),
    [users]
  );
  const selectableIds = useMemo(() => liveUsers.filter((u) => u.id !== selfId).map((u) => u.id), [liveUsers, selfId]);
  const selection = useRowSelection(selectableIds);

  const selectedPendingIds = liveUsers.filter((u) => u.status === "PENDING" && selection.isSelected(u.id) && u.id !== selfId).map((u) => u.id);
  const selectedActiveIds = liveUsers.filter((u) => u.status === "ACTIVE" && selection.isSelected(u.id) && u.id !== selfId).map((u) => u.id);

  function bulkChange(ids: string[], status: "REJECTED" | "DEACTIVATED") {
    if (ids.length === 0) return;
    const verb = status === "REJECTED" ? "Reject" : "Deactivate and archive";
    if (!confirm(`${verb} ${ids.length} account${ids.length === 1 ? "" : "s"}?`)) return;
    setBulkMessage(null);
    startBulk(async () => {
      const result = await bulkSetUserStatusAction(ids, status);
      if (result.error) setBulkMessage(result.error);
      else selection.clear();
      load();
    });
  }

  const pendingCount = liveUsers.filter((u) => u.status === "PENDING").length;

  return (
    <div>
      <PageHeader title="Users" description="Approve new agent applications, manage platform accounts, and choose who appears on the public website." />

      <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-6">
          <h2 className="font-serif text-lg font-bold text-navy-900">User Management</h2>
          <div className="flex flex-wrap items-center gap-3">
            {pendingCount > 0 && (
              <Badge tone="gold">
                {pendingCount} Pending Approval{pendingCount === 1 ? "" : "s"}
              </Badge>
            )}
            {users && (
              <button
                type="button"
                onClick={() => setArchiveOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-navy-900 transition-colors hover:bg-offwhite"
              >
                <Archive size={14} /> Archived accounts ({archivedUsers.length})
              </button>
            )}
          </div>
        </div>

        <BulkActionBar
          count={selection.selectedIds.length}
          onClear={selection.clear}
          busy={bulkPending}
          error={bulkMessage}
          className="border-b border-black/5"
        >
          {selectedPendingIds.length > 0 && (
            <BulkActionButton onClick={() => bulkChange(selectedPendingIds, "REJECTED")} disabled={bulkPending}>
              <XIcon size={14} /> Reject {selectedPendingIds.length}
            </BulkActionButton>
          )}
          {selectedActiveIds.length > 0 && (
            <BulkActionButton onClick={() => bulkChange(selectedActiveIds, "DEACTIVATED")} disabled={bulkPending}>
              <UserX size={14} /> Deactivate {selectedActiveIds.length}
            </BulkActionButton>
          )}
        </BulkActionBar>

        {loadError && <p className="px-6 py-6 text-sm text-red-600">{loadError}</p>}

        {!loadError && !users && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">Loading users…</p>
        )}

        {users && users.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">No users yet.</p>
        )}

        {users && users.length > 0 && liveUsers.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">
            No active or pending users. Deactivated and rejected accounts are under Archived accounts.
          </p>
        )}

        {liveUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-400">
                  <th className="w-12 py-3 pl-6 pr-0">
                    <Checkbox
                      state={selection.headerState}
                      onChange={selection.toggleAll}
                      disabled={selectableIds.length === 0 || bulkPending}
                      label="Select all users"
                    />
                  </th>
                  <th className="px-6 py-3 font-medium">User Profile</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Public Website</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {liveUsers.map((user) => {
                  const status = statusDisplay[user.status];
                  const busy = isPending && pendingId === user.id;
                  return (
                    <tr
                      key={user.id}
                      className={`border-t border-black/5 ${selection.isSelected(user.id) ? "bg-gold-100/40" : ""}`}
                    >
                      <td className="w-12 py-4 pl-6 pr-0">
                        {user.id !== selfId && (
                          <Checkbox
                            state={selection.isSelected(user.id) ? "checked" : "unchecked"}
                            onChange={() => selection.toggle(user.id)}
                            disabled={bulkPending}
                            label={`Select ${user.name}`}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.photo ?? undefined} initials={getInitials(user.name)} size={36} />
                          <div>
                            <p className="font-semibold text-navy-900">{user.name}</p>
                            <p className="text-xs text-gray-400">
                              {user.email} &middot;{" "}
                              <span className="font-mono font-semibold text-navy-900">{user.agentCode}</span>
                            </p>
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
                        {user.status === "ACTIVE" ? (
                          <div className="flex flex-col items-start gap-1">
                            <Toggle
                              checked={user.publicListed}
                              disabled={listingBusyId === user.id}
                              onChange={(next) => toggleListing(user.id, next)}
                              label={`Show ${user.name} on the public website`}
                            />
                            {!user.publicListed && user.listingMissing.length > 0 && (
                              <p className="max-w-40 text-[11px] leading-tight text-gray-400">
                                Needs {user.listingMissing.join(" & ")}
                              </p>
                            )}
                            {listingError?.id === user.id && (
                              <p className="max-w-48 text-[11px] leading-tight text-red-600">{listingError.message}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
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

      {archiveOpen && (
        <ArchivedAccountsModal users={archivedUsers} onClose={() => setArchiveOpen(false)} onChanged={load} />
      )}
    </div>
  );
}
