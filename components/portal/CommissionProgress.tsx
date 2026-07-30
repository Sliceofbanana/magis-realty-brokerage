import Link from "next/link";
import { Wallet, Banknote, HandCoins, ReceiptText, History } from "lucide-react";
import { commissionRecords } from "@/lib/data/commissionReleases";
import {
  commissionReleaseSummary,
  formatReleaseDate,
  ReleaseStatus,
} from "@/lib/commissions";
import { formatCurrency } from "@/lib/format";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Badge } from "@/components/ui/Badge";

const statusConfig: Record<ReleaseStatus, { label: string; tone: "green" | "gold" | "blue"; bar: string }> = {
  "fully-released": { label: "Fully Released", tone: "green", bar: "bg-emerald-500" },
  "partially-released": { label: "Partially Released", tone: "gold", bar: "bg-gold-500" },
  "pending-initial": { label: "Pending Initial Release", tone: "blue", bar: "bg-navy-600" },
};

export function CommissionProgress() {
  const summary = commissionReleaseSummary(commissionRecords);
  const overall = statusConfig[summary.overallStatus];

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy-900">
            Commission Release Progress
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {summary.releaseCount} release{summary.releaseCount === 1 ? "" : "s"} made
            {summary.lastRelease &&
              ` · last released ${formatReleaseDate(summary.lastRelease.date)}`}
          </p>
        </div>
        <Link
          href="/portal/commissions"
          className="text-xs font-semibold text-navy-900 hover:text-gold-600"
        >
          View Full Commission Report
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-navy-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                <Wallet size={18} />
              </span>
              Payout Summary
            </h3>
            <Badge tone={overall.tone}>{overall.label}</Badge>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-offwhite p-4">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gray-400">
                <ReceiptText size={12} /> Total Earned
              </p>
              <p className="mt-1 font-serif text-xl font-bold text-navy-900">
                {formatCurrency(summary.totalEarned)}
              </p>
            </div>
            <div className="rounded-xl bg-offwhite p-4">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gray-400">
                <Banknote size={12} /> Released
              </p>
              <p className="mt-1 font-serif text-xl font-bold text-emerald-600">
                {formatCurrency(summary.totalReleased)}
              </p>
            </div>
            <div className="rounded-xl bg-offwhite p-4">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gray-400">
                <HandCoins size={12} /> Remaining
              </p>
              <p className="mt-1 font-serif text-xl font-bold text-gold-600">
                {formatCurrency(summary.remaining)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Release Progress</span>
              <span className="font-bold text-navy-900">{Math.round(summary.releasedPct)}%</span>
            </div>
            <div
              className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-black/10"
              role="progressbar"
              aria-valuenow={Math.round(summary.releasedPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gold-500"
                style={{ width: `${Math.min(100, summary.releasedPct)}%` }}
              />
            </div>
          </div>

          <div className="mt-6 border-t border-black/5 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              By Commission Record
            </p>
            <ul className="mt-3 space-y-4">
              {summary.records.map(({ record, released, remaining, releasedPct, status }) => {
                const config = statusConfig[status];
                return (
                  <li key={record.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-navy-900">{record.property}</p>
                      <Badge tone={config.tone}>{config.label}</Badge>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
                        <div
                          className={`h-full rounded-full ${config.bar}`}
                          style={{ width: `${Math.min(100, releasedPct)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-bold text-navy-900">
                        {Math.round(releasedPct)}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatCurrency(released)} of {formatCurrency(record.earned)} released
                      {remaining > 0 && ` · ${formatCurrency(remaining)} pending`}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center border-b border-black/5 pb-5 text-center">
            <ProgressRing percent={Math.round(summary.releasedPct)} size={110} />
            <p className="mt-3 text-sm font-semibold text-navy-900">Commission Released</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {formatCurrency(summary.remaining)} awaiting release
            </p>
          </div>

          <p className="mt-5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            <History size={12} /> Release History
          </p>
          <ul className="mt-3 space-y-4">
            {summary.timeline.map((entry) => (
              <li key={entry.id} className="relative pl-5">
                <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-gold-500 bg-white" />
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-emerald-600">
                    +{formatCurrency(entry.amount)}
                  </p>
                  <p className="text-xs text-gray-400">{formatReleaseDate(entry.date)}</p>
                </div>
                <p className="text-xs leading-snug text-navy-900">{entry.property}</p>
                {entry.note && <p className="mt-0.5 text-[11px] text-gray-400">{entry.note}</p>}
              </li>
            ))}
            {summary.timeline.length === 0 && (
              <li className="text-sm text-gray-400">No releases recorded yet.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
