import { QuotaPeriod } from "@/lib/data/leaderboard";

const DAY = 86_400_000;

export type QuotaStatus = "achieved" | "on-track" | "needs-attention" | "behind";

export type QuotaStats = {
  progressPct: number;
  remaining: number;
  elapsedPct: number;
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
  requiredPerDay: number;
  pacePerDay: number;
  projectedPct: number;
  onPace: boolean;
  status: QuotaStatus;
};

export function periodMath(period: QuotaPeriod) {
  const start = Date.parse(period.start);
  const end = Date.parse(period.end);
  const asOf = Date.parse(period.asOf);
  const totalDays = Math.round((end - start) / DAY) + 1;
  const elapsedDays = Math.min(totalDays, Math.max(1, Math.floor((asOf - start) / DAY) + 1));
  const remainingDays = Math.max(1, totalDays - elapsedDays);
  const elapsedPct = (elapsedDays / totalDays) * 100;
  return { totalDays, elapsedDays, remainingDays, elapsedPct };
}

export function quotaStats(quota: number, achieved: number, period: QuotaPeriod): QuotaStats {
  const { totalDays, elapsedDays, remainingDays, elapsedPct } = periodMath(period);
  const progressPct = quota > 0 ? (achieved / quota) * 100 : 0;
  const remaining = Math.max(0, quota - achieved);
  const requiredPerDay = remaining / remainingDays;
  const pacePerDay = achieved / elapsedDays;
  const projectedPct = quota > 0 ? ((pacePerDay * totalDays) / quota) * 100 : 0;
  const onPace = projectedPct >= 100;

  const status: QuotaStatus =
    progressPct >= 100
      ? "achieved"
      : progressPct >= elapsedPct - 5
        ? "on-track"
        : progressPct >= elapsedPct - 20
          ? "needs-attention"
          : "behind";

  return {
    progressPct,
    remaining,
    elapsedPct,
    totalDays,
    elapsedDays,
    remainingDays,
    requiredPerDay,
    pacePerDay,
    projectedPct,
    onPace,
    status,
  };
}

export function formatCompactUsd(value: number) {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m >= 10 ? m.toFixed(1) : m.toFixed(2).replace(/0$/, "")}M`;
  }
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

export function motivationalMessage(stats: QuotaStats) {
  if (stats.status === "achieved") {
    return "Quota achieved — outstanding work! Every additional close is pure upside.";
  }
  const away = Math.ceil(100 - stats.progressPct);
  if (away <= 20) {
    return `You're only ${away}% away from reaching your quota!`;
  }
  if (stats.onPace) {
    return "Keep this pace — you're projected to hit your quota before the period ends.";
  }
  return `Close ${formatCompactUsd(stats.requiredPerDay)} per day to finish the period strong.`;
}
