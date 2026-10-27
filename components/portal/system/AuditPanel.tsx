"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, Download, ScrollText, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AUDIT_EXPORT_LIMIT, AUDIT_PAGE_SIZE, type AuditFilters } from "@/lib/auditLog";
import { exportAuditLogAction, listAuditLogAction, type AuditPage } from "@/lib/actions/systemAudit";
import { Card, Notice, Pill, downloadCsv } from "./ui";

type Draft = { q: string; module: string; from: string; to: string; securityOnly: boolean };

const EMPTY: Draft = { q: "", module: "", from: "", to: "", securityOnly: false };

const fieldLabel = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900";
const field = "w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none";

export function AuditPanel() {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [applied, setApplied] = useState<AuditFilters>({});
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AuditPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let live = true;
    listAuditLogAction({ ...applied, page })
      .then((result) => {
        if (!live) return;
        setData(result);
        setError(null);
        if (result.page !== page) setPage(result.page);
      })
      .catch(() => {
        if (live) setError("Couldn't load the audit log.");
      })
      .finally(() => {
        if (live) setBusy(false);
      });
    return () => {
      live = false;
    };
  }, [applied, page]);

  function apply(next: Draft) {
    setBusy(true);
    setNote(null);
    setPage(1);
    setApplied({
      q: next.q.trim() || undefined,
      module: next.module || undefined,
      from: next.from || undefined,
      to: next.to || undefined,
      securityOnly: next.securityOnly,
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    apply(draft);
  }

  function setPreset(securityOnly: boolean) {
    const next = { ...draft, securityOnly, module: securityOnly ? "" : draft.module };
    setDraft(next);
    apply(next);
  }

  function reset() {
    setDraft(EMPTY);
    apply(EMPTY);
  }

  function goTo(next: number) {
    setBusy(true);
    setPage(next);
  }

  async function exportCsv() {
    setExporting(true);
    setNote(null);
    try {
      const result = await exportAuditLogAction(applied);
      downloadCsv(result.filename, result.csv);
      setNote({
        ok: true,
        text: `Exported ${result.count.toLocaleString("en-PH")} entr${result.count === 1 ? "y" : "ies"}${
          result.truncated ? `, the newest ${AUDIT_EXPORT_LIMIT.toLocaleString("en-PH")}. Narrow the filters to get the rest` : ""
        }.`,
      });
      // The export is itself recorded, so show it.
      setApplied((a) => ({ ...a }));
    } catch {
      setNote({ ok: false, text: "The export failed. Try again." });
    } finally {
      setExporting(false);
    }
  }

  const first = data && data.total > 0 ? (data.page - 1) * AUDIT_PAGE_SIZE + 1 : 0;
  const last = data ? Math.min(data.page * AUDIT_PAGE_SIZE, data.total) : 0;

  return (
    <div className="space-y-6">
      <Card
        icon={<ScrollText size={18} />}
        title="Audit log"
        description="Who did what, and when: sign-ins, leads, careers, accounts, permissions and system changes. Times are Manila time."
        action={
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={exporting || !data || data.total === 0}>
            <Download size={13} aria-hidden="true" /> {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        }
      >
        <div role="group" aria-label="View" className="mb-4 flex gap-2">
          {[
            { label: "All activity", value: false },
            { label: "Security events", value: true },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              aria-pressed={draft.securityOnly === p.value}
              onClick={() => setPreset(p.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                draft.securityOnly === p.value ? "bg-navy-900 text-white" : "bg-offwhite text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label htmlFor="audit-q" className={fieldLabel}>Search</label>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                id="audit-q"
                value={draft.q}
                onChange={(e) => setDraft({ ...draft, q: e.target.value })}
                placeholder="Action or person, e.g. Failed sign-in"
                className={`${field} pl-9`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="audit-module" className={fieldLabel}>Module</label>
            <select
              id="audit-module"
              value={draft.module}
              disabled={draft.securityOnly}
              onChange={(e) => setDraft({ ...draft, module: e.target.value })}
              className={`${field} disabled:opacity-50`}
            >
              <option value="">{draft.securityOnly ? "Security modules" : "All modules"}</option>
              {data?.modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="audit-from" className={fieldLabel}>From</label>
            <input id="audit-from" type="date" value={draft.from} max={draft.to || undefined} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={field} />
          </div>
          <div>
            <label htmlFor="audit-to" className={fieldLabel}>To</label>
            <input id="audit-to" type="date" value={draft.to} min={draft.from || undefined} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={field} />
          </div>
          <div className="flex gap-2 sm:col-span-2 xl:col-span-5">
            <Button type="submit" size="sm" disabled={busy}>Apply filters</Button>
            <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={busy}>Reset</Button>
          </div>
        </form>

        {note && (
          <p role="status" className={`mt-4 text-sm ${note.ok ? "text-emerald-700" : "text-red-600"}`}>
            {note.text}
          </p>
        )}
      </Card>

      {error && <Notice tone="bad">{error}</Notice>}

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm" aria-busy={busy}>
        {!data && !error && <p role="status" className="px-6 py-10 text-center text-sm text-gray-400">Loading…</p>}
        {data && data.entries.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">No entries match these filters.</p>
        )}
        {data && data.entries.length > 0 && (
          <>
            {/* Phones: one card per entry, so "what happened" is never scrolled off-screen. */}
            <ul className={`divide-y divide-black/5 transition-opacity md:hidden ${busy ? "opacity-60" : ""}`}>
              {data.entries.map((e) => (
                <li key={e.id} className="px-4 py-3">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-navy-900">
                    {e.action}
                    {e.action.startsWith("Failed") && <Pill tone="bad">Failed</Pill>}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {e.user} · {e.module}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {e.timestamp}
                    {e.ip !== "—" && <span className="font-mono"> · {e.ip}</span>}
                  </p>
                </li>
              ))}
            </ul>
            <div className={`hidden overflow-x-auto transition-opacity md:block ${busy ? "opacity-60" : ""}`}>
              <table className="w-full min-w-175 text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-gray-400">
                    <th scope="col" className="px-6 py-3 font-medium">Time</th>
                    <th scope="col" className="px-6 py-3 font-medium">Person</th>
                    <th scope="col" className="px-6 py-3 font-medium">What happened</th>
                    <th scope="col" className="px-6 py-3 font-medium">Module</th>
                    <th scope="col" className="px-6 py-3 font-medium">IP address</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((e) => (
                    <tr key={e.id} className="border-t border-black/5">
                      <td className="whitespace-nowrap px-6 py-3 text-gray-500">{e.timestamp}</td>
                      <td className="px-6 py-3 font-semibold text-navy-900">{e.user}</td>
                      <td className="px-6 py-3 text-navy-900">
                        {e.action}
                        {e.action.startsWith("Failed") && (
                          <span className="ml-2 align-middle"><Pill tone="bad">Failed</Pill></span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-500">{e.module}</td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-400">{e.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-6 py-3">
              <p className="text-xs text-gray-500">
                Showing {first.toLocaleString("en-PH")}–{last.toLocaleString("en-PH")} of {data.total.toLocaleString("en-PH")}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => goTo(data.page - 1)} disabled={busy || data.page <= 1} aria-label="Previous page">
                  <ChevronLeft size={14} aria-hidden="true" />
                </Button>
                <span className="text-xs text-gray-500">
                  Page {data.page} of {data.pageCount}
                </span>
                <Button variant="outline" size="sm" onClick={() => goTo(data.page + 1)} disabled={busy || data.page >= data.pageCount} aria-label="Next page">
                  <ChevronRight size={14} aria-hidden="true" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Notice>
        Only some actions are recorded so far: sign-ins and failed sign-ins, permission changes, forced sign-outs, exports, and changes
        to leads, careers, accounts and the system. Listing, commission and document edits aren&rsquo;t logged yet.
      </Notice>
    </div>
  );
}
