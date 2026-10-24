"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  quotaStats,
  formatCompactPeso,
  motivationalMessage,
  QuotaStats,
  QuotaStatus,
} from "@/lib/quota";
import type { LeaderboardData } from "@/lib/leaderboard";
import { setAgentQuotaAction } from "@/lib/actions/quotas";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useRole } from "@/components/portal/RoleContext";
import { LeaderboardAgent, LeaderboardTeam, QuotaPeriod } from "@/lib/types";
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

function TeamTag({ team, className = "" }: { team: LeaderboardTeam; className?: string }) {
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

/** The quota figure for one agent, with an inline editor for people allowed to set quotas. */
function QuotaCell({
  agentId,
  periodId,
  quota,
  canEdit,
}: {
  agentId: string;
  periodId: QuotaPeriod["id"];
  quota: number;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    const result = await setAgentQuotaAction(agentId, periodId, Number(value));
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">₱</span>
          <input
            type="number"
            min={0}
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-28 rounded-md border border-black/10 bg-white px-2 py-1 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
          />
          <button type="button" onClick={save} disabled={busy} aria-label="Save quota" className="text-emerald-600 disabled:opacity-40">
            <Check size={15} />
          </button>
          <button type="button" onClick={() => setEditing(false)} aria-label="Cancel" className="text-gray-400 hover:text-navy-900">
            <X size={15} />
          </button>
        </div>
        {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      {quota > 0 ? formatCompactPeso(quota) : <span className="text-gray-300">Not set</span>}
      {canEdit && (
        <button
          type="button"
          onClick={() => {
            setValue(quota > 0 ? String(quota) : "");
            setEditing(true);
          }}
          aria-label="Set quota"
          className="text-gray-300 hover:text-navy-900"
        >
          <Pencil size={13} />
        </button>
      )}
    </span>
  );
}

function MyPerformanceCard({
  row,
  period,
  team,
  agentCount,
}: {
  row: Row;
  period: QuotaPeriod;
  team: LeaderboardTeam;
  agentCount: number;
}) {
  const { stats } = row;
  return (
    <div className="rounded-2xl bg-navy-950 p-6 text-white shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">My Performance</p>
          <p className="mt-1 font-serif text-xl font-bold">
            Rank #{row.rank}{" "}
            <span className="text-sm font-normal text-white/60">
              of {agentCount} agents &bull; {period.cycleLabel}
            </span>
          </p>
          <TeamTag team={team} className="mt-2" />
        </div>
        <StatusBadge status={stats.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/50">
            <Target size={12} /> Assigned Quota
          </p>
          <p className="mt-1 font-serif text-lg font-bold">{formatCompactPeso(row.quota)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/50">
            <TrendingUp size={12} /> Achieved
          </p>
          <p className="mt-1 font-serif text-lg font-bold">{formatCompactPeso(row.achieved)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/50">
            <Flag size={12} /> Remaining
          </p>
          <p className="mt-1 font-serif text-lg font-bold text-gold-400">{formatCompactPeso(stats.remaining)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/50">
            <CalendarClock size={12} /> Needed / Day
          </p>
          <p className="mt-1 font-serif text-lg font-bold">
            {stats.remaining === 0 ? "—" : formatCompactPeso(stats.requiredPerDay)}
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

export function LeaderboardView({ data }: { data: LeaderboardData }) {
  const { periods, teams, agents } = data;
  const { hasPermission } = useRole();
  const canSetQuotas = hasPermission("set-agent-quotas");
  const [periodId, setPeriodId] = useState<QuotaPeriod["id"]>("quarterly");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const period = periods.find((p) => p.id === periodId) ?? periods[periods.length - 1];
  const teamById = (id: string) => teams.find((t) => t.id === id) ?? teams[teams.length - 1];

  const rows = useMemo<Row[]>(() => {
    return agents
      .map((agent) => {
        const quota = agent.quota[period.id];
        const achieved = agent.achieved[period.id];
        return { agent, quota, achieved, stats: quotaStats(quota, achieved, period) };
      })
      .sort((a, b) => b.achieved - a.achieved)
      .map((row, i) => ({ ...row, rank: i + 1 }));
  }, [agents, period]);

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
    const groups = teams.map((team) => {
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
  }, [sortedRows, teams]);

  const me = rows.find((row) => row.agent.isYou);
  // Only celebrate people who've actually closed something this period.
  const podium = rows.filter((r) => r.achieved > 0).slice(0, 3);
  const [first, second, third] = podium;

  function exportCsv() {
    const header = ["Rank", "Agent", "Region", "Team", "Progress %", "Achieved", "Remaining", "Quota"];
    const lines = sortedRows.map((row) => [
      String(row.rank),
      row.agent.name,
      row.agent.region,
      teamById(row.agent.teamId).name,
      String(Math.round(row.stats.progressPct)),
      String(row.achieved),
      String(row.stats.remaining),
      String(row.quota),
    ]);
    const csv = [header, ...lines]
      .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leaderboard-${period.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
        description={`Rankings & quota progress — ${period.cycleLabel}`}
        action={
          <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">
            {periods.map((p) => (
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

      {me && me.quota > 0 && (
        <MyPerformanceCard row={me} period={period} team={teamById(me.agent.teamId)} agentCount={agents.length} />
      )}

      {agents.length === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-black/10 p-16 text-center text-gray-400">
          No active agents yet. Approved agents and brokers will appear here.
        </div>
      )}

      {podium.length > 0 && (
        <div className="mt-8 grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
          {[second, first, third].filter(Boolean).map((row) => (
            <div
              key={row.agent.id}
              className={row.rank === 1 ? "sm:order-2" : row.rank === 2 ? "sm:order-1" : "sm:order-3"}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`relative rounded-full border-4 ${
                    row.rank === 1 ? "border-gold-500" : "border-white"
                  }`}
                >
                  <Avatar src={row.agent.photo ?? undefined} name={row.agent.name} size={row.rank === 1 ? 112 : 80} />
                  <span className="absolute -bottom-1 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white">
                    {row.rank}
                  </span>
                </div>
                <p className="mt-3 font-serif text-lg font-bold text-navy-900">{row.agent.name}</p>
                <p className="text-sm text-gold-600">{formatCompactPeso(row.achieved)} Volume</p>
                {row.quota > 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    {Math.round(row.stats.progressPct)}% of {formatCompactPeso(row.quota)} quota
                  </p>
                )}
                <TeamTag team={teamById(row.agent.teamId)} className="mt-2" />
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
      )}

      {agents.length > 0 && (
        <div className="mt-8 rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-navy-900">Team Standings</h2>
              <p className="mt-0.5 text-xs text-gray-400">
                {period.cycleLabel} &bull; grouped by team, ranked by team quota progress
              </p>
            </div>
            {hasPermission("export-reports") && (
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download size={14} /> Export
              </Button>
            )}
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
                            <p className="text-xs text-gray-400">
                              {group.rows.length} agent{group.rows.length === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[11px] uppercase tracking-wide text-gray-400">Team Achieved</p>
                            <p className="text-sm font-bold text-navy-900">
                              {formatCompactPeso(group.totalAchieved)} / {formatCompactPeso(group.totalQuota)}
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
                        row.stats.status === "achieved" && row.quota > 0
                          ? "bg-gold-100/40"
                          : row.agent.isYou
                            ? "bg-sky-100/40"
                            : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-navy-900">{row.rank}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={row.agent.photo ?? undefined} name={row.agent.name} size={36} />
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
                        {row.quota > 0 ? (
                          <div className="flex items-center gap-3">
                            <ProgressBar stats={row.stats} className="w-28" />
                            <span className="w-10 text-xs font-bold text-navy-900">
                              {Math.round(row.stats.progressPct)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-navy-900">{formatCompactPeso(row.achieved)}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {row.quota === 0 ? (
                          "—"
                        ) : row.stats.remaining === 0 ? (
                          <span className="font-semibold text-gold-600">Goal met</span>
                        ) : (
                          formatCompactPeso(row.stats.remaining)
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <QuotaCell
                          agentId={row.agent.id}
                          periodId={period.id}
                          quota={row.quota}
                          canEdit={canSetQuotas}
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {row.quota === 0 || row.stats.remaining === 0 ? "—" : formatCompactPeso(row.stats.requiredPerDay)}
                      </td>
                      <td className="px-6 py-4">
                        {row.quota > 0 ? (
                          <StatusBadge status={row.stats.status} />
                        ) : (
                          <span className="text-xs text-gray-300">No quota set</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
