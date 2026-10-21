"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Trash2, UserCheck, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Checkbox } from "@/components/ui/Checkbox";
import { BulkActionBar, BulkActionButton } from "@/components/portal/BulkActionBar";
import { useRowSelection } from "@/lib/useRowSelection";
import {
  bulkSetUserStatusAction,
  deleteArchivedUsersAction,
  type AdminUserRow,
} from "@/lib/actions/users";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Every archived (deactivated or rejected) account in one place. An account with
 * no activity at all can be deleted permanently; the rest can only be reactivated.
 */
export function ArchivedAccountsModal({
  users,
  onClose,
  onChanged,
}: {
  users: AdminUserRow[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const ids = useMemo(() => users.map((u) => u.id), [users]);
  const selection = useRowSelection(ids);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { selectedIds } = selection;
  const deletableSelected = useMemo(() => {
    const idle = new Set(users.filter((u) => u.activityCount === 0).map((u) => u.id));
    return selectedIds.filter((id) => idle.has(id));
  }, [users, selectedIds]);

  function run(task: () => Promise<{ error?: string; note?: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await task();
      if (result.error) {
        setMessage(result.error);
        return;
      }
      selection.clear();
      if (result.note) setMessage(result.note);
      onChanged();
    });
  }

  function reactivate(targets: string[]) {
    run(async () => {
      const r = await bulkSetUserStatusAction(targets, "ACTIVE");
      return { error: r.error, note: r.skipped ? `${r.skipped} couldn't be reactivated.` : undefined };
    });
  }

  function remove(targets: string[]) {
    const n = targets.length;
    if (n === 0) return;
    if (!confirm(`Permanently delete ${n} account${n === 1 ? "" : "s"}? This can't be undone.`)) return;
    run(async () => {
      const r = await deleteArchivedUsersAction(targets);
      return { error: r.error, note: r.skipped ? `${r.skipped} couldn't be deleted and were kept.` : undefined };
    });
  }

  const selectedCount = selectedIds.length;
  const withActivity = selectedCount - deletableSelected.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archived-accounts-title"
      className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-black/5 px-6 py-4">
          <div>
            <h2 id="archived-accounts-title" className="font-serif text-lg font-bold text-navy-900">
              Archived accounts
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Deactivated and rejected accounts. Only accounts with no activity can be deleted permanently.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-navy-900">
            <X size={20} />
          </button>
        </div>

        <BulkActionBar
          count={selectedCount}
          onClear={selection.clear}
          busy={pending}
          error={message}
          className="border-b border-black/5"
        >
          <BulkActionButton tone="neutral" onClick={() => reactivate(selection.selectedIds)} disabled={pending}>
            <UserCheck size={14} /> Reactivate
          </BulkActionButton>
          <BulkActionButton
            onClick={() => remove(deletableSelected)}
            disabled={pending || deletableSelected.length === 0}
          >
            <Trash2 size={14} /> Delete {deletableSelected.length} permanently
          </BulkActionButton>
          {withActivity > 0 && (
            <span className="text-xs text-gray-600">
              {withActivity} with activity can&apos;t be deleted
            </span>
          )}
        </BulkActionBar>
        {selectedCount === 0 && message && (
          <p role="alert" className="border-b border-black/5 bg-red-50 px-4 py-2 text-xs text-red-700">
            {message}
          </p>
        )}

        <div className="overflow-auto">
          {users.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-400">No archived accounts.</p>
          ) : (
            <table className="w-full min-w-130 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-400">
                  <th className="w-12 py-3 pl-6 pr-0">
                    <Checkbox
                      state={selection.headerState}
                      onChange={selection.toggleAll}
                      disabled={pending}
                      label="Select all archived accounts"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Archived as</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-t border-black/5 ${selection.isSelected(user.id) ? "bg-gold-100/40" : ""}`}
                  >
                    <td className="w-12 py-3 pl-6 pr-0">
                      <Checkbox
                        state={selection.isSelected(user.id) ? "checked" : "unchecked"}
                        onChange={() => selection.toggle(user.id)}
                        disabled={pending}
                        label={`Select ${user.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.photo ?? undefined} initials={getInitials(user.name)} size={32} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-navy-900">{user.name}</p>
                          <p className="truncate text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {user.status === "REJECTED" ? "Rejected" : "Deactivated"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {user.activityCount === 0 ? (
                        <span className="text-emerald-600">No activity</span>
                      ) : (
                        <span className="text-gray-500">
                          {user.activityCount} record{user.activityCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-3 text-gray-400">
                        <button
                          type="button"
                          aria-label={`Reactivate ${user.name}`}
                          disabled={pending}
                          onClick={() => reactivate([user.id])}
                          className="text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
                        >
                          <UserCheck size={15} />
                        </button>
                        {user.activityCount === 0 && (
                          <button
                            type="button"
                            aria-label={`Delete ${user.name} permanently`}
                            disabled={pending}
                            onClick={() => remove([user.id])}
                            className="hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
