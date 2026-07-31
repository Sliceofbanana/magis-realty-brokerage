"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Trophy,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Target,
  Flag,
  CalendarClock,
  TrendingUp,
} from "lucide-react";
import { leaderboardAgents, leaderboardTeams, quotaPeriods, QuotaPeriod } from "@/lib/data/leaderboard";
import {
  quotaStats,
  formatCompactUsd,
  motivationalMessage,
  QuotaStats,
  QuotaStatus,
} from "@/lib/quota";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { LeaderboardAgent } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

type Row = {
  agent: LeaderboardAgent;
  rank: number;
  quota: number;
  achieved: number;
  stats: QuotaStats;
};

type SortKey = "rank" | "progress" | "achieved" | "remaining" | "quota";
type SortDir = "asc" | "desc";

const statusConfig: Record<QuotaStatus, { label: string; badge: string; dot: string; bar: string }> = {
  achieved: {
    label: "Quota Achieved",
    badge: "bg-gold-100 text-gold-600",
    dot: "bg-gold-500",
    bar: "bg-gold-500",
  },
  "on-track": {
    label: "On Track",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  "needs-attention": {
    label: "Needs Attention",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  behind: {
    label: "Behind Target",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-500",
    bar: "bg-red-500",
  },
};

function teamFor(teamId: LeaderboardAgent["teamId"]) {
  return leaderboardTeams.find((t) => t.id === teamId) ?? leaderboardTeams[0];
}

function TeamTag({
  teamId,
  className = "",
}: {
  teamId: LeaderboardAgent["teamId"];
  className?: string;
}) {
  const team = teamFor(teamId);
  return (
    <Badge tone={team.tone} className={className}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {team.name}
    </Badge>
  );
}

const tierLabel = (rank: number) =>
  rank === 1 ? "Platinum Top Performer" : rank === 2 ? "Silver Tier" : "Bronze Tier";

function ProgressBar({ stats, className = "" }: { stats: QuotaStats; className?: string }) {
  const config = statusConfig[stats.status];
  const width = Math.min(100, stats.progressPct);
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-black/10 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(stats.progressPct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full rounded-full ${config.bar}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function StatusBadge({ status }: { status: QuotaStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function SortHeader({
  label,
  sort,
  sortKey,
  sortDir,
  onToggle,
}: {
  label: string;
  sort: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onToggle: (key: SortKey) => void;
}) {
  const active = sortKey === sort;
  const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onToggle(sort)}
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors ${
        active ? "text-navy-900" : "text-gray-400 hover:text-navy-900"
      }`}
    >
      {label} <Icon size={12} />
    </button>
  );
}

function MyPerformanceCard({ row, period }: { row: Row; period: QuotaPeriod }) {
  const { stats } = row;
  return (
    <div className="rounded-2xl bg-navy-950 p-6 text-white shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            My Performance
          </p>
          <p className="mt-1 font-serif text-xl font-bold">
            Rank #{row.rank}{" "}
            <span className="text-sm font-normal text-white/60">
              of {leaderboardAgents.length} agents &bull; {period.cycleLabel}
            </span>
          </p>
          <TeamTag teamId={row.agent.teamId} className="mt-2" />
        </div>
        <StatusBadge status={stats.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/50">
            <Target size={12} /> Assigned Quota
          </p>
          <p className="mt-1 font-serif text-lg font-bold">{formatCompactUsd(row.quota)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/50">
            <TrendingUp size={12} /> Achieved
          </p>
          <p className="mt-1 font-serif text-lg font-bold">{formatCompactUsd(row.achieved)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/50">
            <Flag size={12} /> Remaining
          </p>
          <p className="mt-1 font-serif text-lg font-bold text-gold-400">
            {formatCompactUsd(stats.remaining)}
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/50">
            <CalendarClock size={12} /> Needed / Day
          </p>
          <p className="mt-1 font-serif text-lg font-bold">
            {stats.remaining === 0 ? "—" : formatCompactUsd(stats.requiredPerDay)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">
            {stats.remainingDays} day{stats.remainingDays === 1 ? "" : "s"} left &bull;{" "}
            {Math.round(stats.elapsedPct)}% of period elapsed
          </span>
          <span className="font-bold">{Math.round(stats.progressPct)}%</span>
        </div>
        <ProgressBar stats={stats} className="mt-1.5 bg-white/15" />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-sm">
        <p className="text-white/80">{motivationalMessage(stats)}</p>
        <p className="text-xs text-white/50">
          {stats.status === "achieved"
            ? "Target reached ahead of deadline"
            : stats.onPace
              ? "Projected to reach quota on current pace"
              : `Projected ${Math.round(stats.projectedPct)}% of quota at current pace`}
        </p>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [periodId, setPeriodId] = useState(quotaPeriods[2].id);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const period = quotaPeriods.find((p) => p.id === periodId) ?? quotaPeriods[2];

  const rows = useMemo<Row[]>(() => {
    const ranked = leaderboardAgents
      .map((agent) => {
        const quota = agent.quota[period.id];
        const achieved = agent.achieved[period.id];
        return { agent, quota, achieved, stats: quotaStats(quota, achieved, period) };
      })
      .sort((a, b) => b.achieved - a.achieved)
      .map((row, i) => ({ ...row, rank: i + 1 }));
    return ranked;
  }, [period]);

  const sortedRows = useMemo(() => {
    const value = (row: Row) =>
      sortKey === "rank"
        ? row.rank
        : sortKey === "progress"
          ? row.stats.progressPct
          : sortKey === "achieved"
            ? row.achieved
            : sortKey === "remaining"
              ? row.stats.remaining
              : row.quota;
    return [...rows].sort((a, b) => (sortDir === "asc" ? value(a) - value(b) : value(b) - value(a)));
  }, [rows, sortKey, sortDir]);

  const teamGroups = useMemo(() => {
    const groups = leaderboardTeams.map((team) => {
      const teamRows = sortedRows.filter((r) => r.agent.teamId === team.id);
      const totalAchieved = teamRows.reduce((sum, r) => sum + r.achieved, 0);
      const totalQuota = teamRows.reduce((sum, r) => sum + r.quota, 0);
      const avgProgress = totalQuota > 0 ? (totalAchieved / totalQuota) * 100 : 0;
      return { team, rows: teamRows, totalAchieved, totalQuota, avgProgress };
    });
    return groups
      .filter((g) => g.rows.length > 0)
      .sort((a, b) => b.avgProgress - a.avgProgress)
      .map((group, i) => ({ ...group, teamRank: i + 1 }));
  }, [sortedRows]);

  const me = rows.find((row) => row.agent.isYou);
  const [first, second, third] = rows;

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  }

  return (
    <div>
      <PageHeader
        title="Agent Leaderboards"
        description={`Live rankings & quota progress — ${period.cycleLabel}`}
        action={
          <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">
            {quotaPeriods.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodId(p.id)}
                className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                  periodId === p.id ? "bg-navy-900 text-white" : "text-gray-500 hover:bg-offwhite"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {me && <MyPerformanceCard row={me} period={period} />}

      <div className="mt-8 grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
        {[second, first, third].filter(Boolean).map((row) => (
          <div
            key={row.agent.id}
            className={row.rank === 1 ? "sm:order-2" : row.rank === 2 ? "sm:order-1" : "sm:order-3"}
          >
            <div className="flex flex-col items-center">
              <div
                className={`relative overflow-hidden rounded-full border-4 ${
                  row.rank === 1 ? "h-28 w-28 border-gold-500" : "h-20 w-20 border-white"
                }`}
              >
                <Image src={row.agent.photo} alt={row.agent.name} fill className="object-cover" />
                <span className="absolute -bottom-1 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white">
                  {row.rank}
                </span>
              </div>
              <p className="mt-3 font-serif text-lg font-bold text-navy-900">{row.agent.name}</p>
              <p className="text-sm text-gold-600">{formatCompactUsd(row.achieved)} Volume</p>
              <p className="mt-1 text-xs text-gray-400">
                {Math.round(row.stats.progressPct)}% of {formatCompactUsd(row.quota)} quota
              </p>
              <TeamTag teamId={row.agent.teamId} className="mt-2" />
            </div>
            <div
              className={`mt-4 flex h-28 flex-col items-center justify-center gap-2 rounded-2xl ${
                row.rank === 1 ? "bg-navy-950 text-white" : "bg-white text-gray-400 shadow-sm"
              }`}
            >
              <Trophy size={row.rank === 1 ? 28 : 22} className={row.rank === 1 ? "text-gold-400" : ""} />
              <p className="text-xs font-semibold uppercase tracking-wide">{tierLabel(row.rank)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-6">
          <div>
            <h2 className="font-serif text-lg font-bold text-navy-900">Team Standings</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {period.cycleLabel} &bull; grouped by team, ranked by team quota progress
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download size={14} /> Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="px-6 py-3"><SortHeader label="Rank" sort="rank" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} /></th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Agent</th>
                <th className="w-56 px-6 py-3"><SortHeader label="Progress" sort="progress" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} /></th>
                <th className="px-6 py-3"><SortHeader label="Achieved" sort="achieved" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} /></th>
                <th className="px-6 py-3"><SortHeader label="Remaining" sort="remaining" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} /></th>
                <th className="px-6 py-3"><SortHeader label="Quota" sort="quota" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} /></th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Req. / Day</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            {teamGroups.map((group) => (
              <tbody key={group.team.id}>
                <tr className="border-t border-black/5 bg-offwhite">
                  <td colSpan={8} className="px-6 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${group.team.dot}`}
                        >
                          <Trophy size={14} />
                        </span>
                        <div>
                          <p className="flex items-center gap-2 font-serif text-sm font-bold text-navy-900">
                            {group.team.name}
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500 shadow-sm">
                              Team Rank #{group.teamRank}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400">{group.rows.length} agents</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wide text-gray-400">
                            Team Achieved
                          </p>
                          <p className="text-sm font-bold text-navy-900">
                            {formatCompactUsd(group.totalAchieved)} / {formatCompactUsd(group.totalQuota)}
                          </p>
                        </div>
                        <div className="w-32">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                            <div
                              className={`h-full rounded-full ${group.team.dot}`}
                              style={{ width: `${Math.min(100, group.avgProgress)}%` }}
                            />
                          </div>
                          <p className="mt-1 text-right text-xs font-bold text-navy-900">
                            {Math.round(group.avgProgress)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <tr
                    key={row.agent.id}
                    className={`border-t border-black/5 border-l-4 ${group.team.border} ${
                      row.stats.status === "achieved"
                        ? "bg-gold-100/40"
                        : row.agent.isYou
                          ? "bg-sky-100/40"
                          : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-navy-900">{row.rank}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                          <Image src={row.agent.photo} alt={row.agent.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">
                            {row.agent.name}
                            {row.agent.isYou && (
                              <span className="ml-2 rounded bg-gold-100 px-2 py-0.5 text-[10px] font-semibold text-gold-600">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{row.agent.region}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProgressBar stats={row.stats} className="w-28" />
                        <span className="w-10 text-xs font-bold text-navy-900">
                          {Math.round(row.stats.progressPct)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-navy-900">
                      {formatCompactUsd(row.achieved)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {row.stats.remaining === 0 ? (
                        <span className="font-semibold text-gold-600">Goal met</span>
                      ) : (
                        formatCompactUsd(row.stats.remaining)
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatCompactUsd(row.quota)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {row.stats.remaining === 0 ? "—" : formatCompactUsd(row.stats.requiredPerDay)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.stats.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
}
