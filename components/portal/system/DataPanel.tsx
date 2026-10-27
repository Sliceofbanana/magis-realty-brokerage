"use client";

import { useState } from "react";
import { Database, Download, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { exportDataAction, getDataOverviewAction, type DataKind } from "@/lib/actions/systemInsights";
import { Card, LoaderGate, Notice, RefreshButton, Rows, downloadCsv, useLoader } from "./ui";

export function DataPanel() {
  const loader = useLoader(getDataOverviewAction);
  const [busy, setBusy] = useState<DataKind | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function download(kind: DataKind, name: string) {
    setBusy(kind);
    setNote(null);
    try {
      const result = await exportDataAction(kind);
      if (result.error || !result.csv || !result.filename) {
        setNote({ ok: false, text: result.error ?? "The export failed. Try again." });
        return;
      }
      downloadCsv(result.filename, result.csv);
      const n = result.count ?? 0;
      setNote({
        ok: true,
        text: `Exported ${n.toLocaleString("en-PH")} ${name.toLowerCase()}${result.truncated ? " (the newest only; the data set is larger than one export)" : ""}.`,
      });
    } catch {
      setNote({ ok: false, text: "The export failed. Try again." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <RefreshButton loader={loader} />
      </div>
      <LoaderGate loader={loader}>
        {(data) => (
          <>
            <Card icon={<Download size={18} />} title="Export data" description="Download a spreadsheet (CSV) of what the portal holds. Each export is recorded in the audit log.">
              {note && (
                <p role="status" className={`mb-3 text-sm ${note.ok ? "text-emerald-700" : "text-red-600"}`}>
                  {note.text}
                </p>
              )}
              <ul className="divide-y divide-black/5 rounded-xl border border-black/5">
                {data.exports.map((x) => (
                  <li key={x.kind} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-900">
                        {x.label} <span className="font-normal text-gray-400">· {x.count.toLocaleString("en-PH")}</span>
                      </p>
                      <p className="text-xs text-gray-500">{x.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => download(x.kind, x.label)} disabled={busy !== null || x.count === 0}>
                      <Download size={13} aria-hidden="true" /> {busy === x.kind ? "Preparing…" : "Download CSV"}
                    </Button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gray-400">
                Up to {data.limit.toLocaleString("en-PH")} rows per file, newest first. The audit log exports from its own tab.
              </p>
              <div className="mt-4">
                <Notice tone="warn">
                  These files hold people&rsquo;s names, emails and phone numbers. Keep them somewhere private and delete them when
                  you&rsquo;re done.
                </Notice>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Card icon={<Database size={18} />} title="What's stored" description="Rows in the main tables right now.">
                <Rows rows={data.records.map((r) => ({ label: r.label, value: r.count.toLocaleString("en-PH") }))} />
              </Card>

              <Card icon={<HardDrive size={18} />} title="Backups and restore" description="Not something this portal does.">
                <Notice>
                  The portal doesn&rsquo;t take, schedule or restore backups, and it can&rsquo;t tell whether they&rsquo;re happening.
                  Those belong to the database host (Supabase or Neon), and what you get depends on the plan. Check the host&rsquo;s dashboard
                  for the last backup, how long they&rsquo;re kept, and how to restore. A restore should be done there, by an authorized
                  administrator.
                </Notice>
              </Card>
            </div>
          </>
        )}
      </LoaderGate>
    </div>
  );
}
