"use client";

import { useMemo, useState } from "react";
import { KeyRound, LogOut, ScrollText, Search, ShieldAlert, ShieldCheck, Timer, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import {
  forceSignOutAction,
  forceSignOutOthersAction,
  getSecurityOverviewAction,
  type SecurityOverview,
} from "@/lib/actions/systemInsights";
import { Card, LoaderGate, Notice, Pill, RefreshButton, Rows, useLoader } from "./ui";

const roleLabel: Record<string, string> = { ADMINISTRATOR: "Administrator", BROKER: "Broker", AGENT: "Agent", MARKETING: "Marketing" };

function SecurityBody({ data, reload }: { data: SecurityOverview; reload: () => void }) {
  const { confirm, confirmDialog } = useConfirm();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const seconds = data.session.recheckSeconds;
  const others = data.users.filter((u) => u.id !== data.currentUserId);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? data.users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : data.users;
  }, [data.users, query]);

  async function signOut(user: SecurityOverview["users"][number]) {
    const ok = await confirm({
      title: `Sign ${user.name} out everywhere?`,
      description: `Every device they're signed in on is ended within about ${seconds} seconds. They can sign back in with their password.`,
      confirmLabel: "Sign out",
    });
    if (!ok) return;
    setBusy(user.id);
    setMessage(null);
    const result = await forceSignOutAction(user.id);
    setBusy(null);
    setMessage(result.error ? { ok: false, text: result.error } : { ok: true, text: `${user.name} will be signed out within about ${seconds} seconds.` });
    if (!result.error) reload();
  }

  async function signOutOthers() {
    const ok = await confirm({
      title: `Sign out ${others.length} other account${others.length === 1 ? "" : "s"}?`,
      description: `Everyone except you is signed out within about ${seconds} seconds. Use this if you suspect an account has been compromised.`,
      confirmLabel: "Sign everyone out",
    });
    if (!ok) return;
    setBusy("all");
    setMessage(null);
    const result = await forceSignOutOthersAction();
    setBusy(null);
    setMessage(result.error ? { ok: false, text: result.error } : { ok: true, text: `${result.count ?? 0} account(s) will be signed out within about ${seconds} seconds.` });
    if (!result.error) reload();
  }

  const a = data.accounts;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: "Active accounts", value: a.active },
          { label: "Awaiting approval", value: a.pending },
          { label: "Deactivated or rejected", value: a.deactivated + a.rejected },
          { label: "Administrators", value: a.administrators },
          { label: "System Admins", value: a.systemAdmins },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-navy-900">{s.value.toLocaleString("en-PH")}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card icon={<KeyRound size={18} />} title="Password policy" description="One rule for registration, resets and changes.">
          <Rows
            rows={[
              { label: "Minimum length", value: `${data.password.minLength} characters` },
              { label: "Maximum length", value: `${data.password.maxBytes} bytes` },
              { label: "Composition rules", value: "None. Length is what counts." },
              { label: "After a change or reset", value: "Other signed-in sessions end" },
            ]}
          />
        </Card>

        <Card icon={<Timer size={18} />} title="Sessions" description="How long a sign-in lasts and what ends it early.">
          <Rows
            rows={[
              { label: "Lifetime", value: `${data.session.lifetimeDays} days` },
              { label: "Account re-checked", value: `at least every ${seconds} seconds` },
              { label: "Ended early by", value: "Deactivation, password change or a forced sign-out" },
            ]}
          />
        </Card>

        <Card
          icon={<ShieldCheck size={18} />}
          title="Sign-in attempt limits"
          description="Too many attempts inside the window and the visitor has to wait."
          action={data.limiter === "redis" ? <Pill tone="good">Shared (Redis)</Pill> : <Pill tone="warn">Per server only</Pill>}
        >
          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full min-w-80 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-400">
                  <th scope="col" className="px-4 py-3 font-medium">Action</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Allowed</th>
                </tr>
              </thead>
              <tbody>
                {data.limits.map((l) => (
                  <tr key={l.label} className="border-t border-black/5">
                    <td className="px-4 py-3 text-navy-900">{l.label}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {l.limit} per {l.minutes} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.limiter === "memory" && (
            <div className="mt-4">
              <Notice tone="warn">
                Redis isn&rsquo;t configured, so each server counts on its own. On serverless hosting that makes these limits much
                weaker. See Integrations.
              </Notice>
            </div>
          )}
          <p className="mt-3 text-xs text-gray-400">There is no permanent lockout: the wait ends when the window does.</p>
        </Card>

        <Card icon={<ShieldAlert size={18} />} title="Multi-factor authentication" description="A second step at sign-in.">
          <Rows rows={[{ label: "Status", value: <Pill>Not available</Pill> }]} />
          <p className="mt-3 text-sm text-gray-500">
            The portal signs in with email and password only. Adding a second factor is a feature to build, not a setting to turn on.
          </p>
        </Card>
      </div>

      <Card
        icon={<Users size={18} />}
        title="Active sessions and forced sign-out"
        description="Sessions live in each person's browser, so there's no list of devices. You can end everything a person is signed in on."
        action={
          <Button variant="outline" size="sm" onClick={signOutOthers} disabled={busy !== null || others.length === 0}>
            <LogOut size={13} aria-hidden="true" /> Sign out everyone else
          </Button>
        }
      >
        {message && (
          <p role="status" className={`mb-3 text-sm ${message.ok ? "text-emerald-700" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
        <div className="relative mb-3">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search accounts"
            className="w-full rounded-lg border border-black/10 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
          />
        </div>
        <ul className="max-h-80 divide-y divide-black/5 overflow-y-auto rounded-xl border border-black/5">
          {visible.length === 0 && <li className="px-4 py-6 text-center text-sm text-gray-400">No accounts match.</li>}
          {visible.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={u.name} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy-900">
                    {u.name} {u.id === data.currentUserId && <span className="text-xs font-normal text-gray-400">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {u.email} · {roleLabel[u.role] ?? u.role}
                    {u.isSystemAdmin ? " · System Admin" : ""}
                  </p>
                </div>
              </div>
              {u.id !== data.currentUserId && (
                <Button variant="outline" size="sm" onClick={() => signOut(u)} disabled={busy !== null} aria-label={`Sign ${u.name} out everywhere`}>
                  {busy === u.id ? "Signing out…" : "Sign out"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card icon={<ScrollText size={18} />} title="Recent security events" description="Sign-ins, failed sign-ins, permission changes, forced sign-outs, exports and system changes. The full history is in Audit log.">
        {data.events.length === 0 ? (
          <p className="rounded-xl border border-black/5 px-4 py-6 text-center text-sm text-gray-400">Nothing recorded yet.</p>
        ) : (
          <ul className="divide-y divide-black/5 rounded-xl border border-black/5">
            {data.events.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-navy-900">
                    {e.action}
                    {e.action.startsWith("Failed") && <Pill tone="bad">Failed</Pill>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {e.user} · {e.module}
                    {e.ip !== "—" && <span className="font-mono"> · {e.ip}</span>}
                  </p>
                </div>
                <p className="text-xs text-gray-400">{e.timestamp}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {confirmDialog}
    </>
  );
}

export function SecurityPanel() {
  const loader = useLoader(getSecurityOverviewAction);
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <RefreshButton loader={loader} />
      </div>
      <LoaderGate loader={loader}>{(data) => <SecurityBody data={data} reload={loader.reload} />}</LoaderGate>
    </div>
  );
}
