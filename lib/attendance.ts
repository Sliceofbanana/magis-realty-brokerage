import { AttendanceConfig, AttendanceSession, AttendanceType, RewardTier } from "@/lib/types";

export type AttendanceBadge = "excellent" | "good" | "needs-improvement";

export type TypeStats = {
  scheduled: number;
  attended: number;
  missed: number;
  rate: number;
  badge: AttendanceBadge;
  currentStreak: number;
  attendedThisMonth: number;
  nextUpcoming?: AttendanceSession;
};

export type MonthTrend = {
  label: string;
  attended: number;
  scheduled: number;
  rate: number;
};

export type AttendanceSummary = {
  meetings: TypeStats;
  pks: TypeStats;
  overallRate: number;
  overallBadge: AttendanceBadge;
  totalPoints: number;
  eligible: boolean;
  earnedTiers: RewardTier[];
  nextTier?: RewardTier;
  prevTierPoints: number;
  progressToNextPct: number;
  pointsRemaining: number;
  meetingsNeeded: number;
  pksNeeded: number;
  longestStreak: number;
  lastAttended?: AttendanceSession;
  monthlyTrend: MonthTrend[];
};

export function badgeFor(rate: number): AttendanceBadge {
  return rate >= 90 ? "excellent" : rate >= 75 ? "good" : "needs-improvement";
}

function inPeriod(session: AttendanceSession, config: AttendanceConfig) {
  return session.date >= config.periodStart && session.date <= config.asOf;
}

function byDate(a: AttendanceSession, b: AttendanceSession) {
  return a.date.localeCompare(b.date);
}

function typeStats(
  sessions: AttendanceSession[],
  type: AttendanceType,
  config: AttendanceConfig
): TypeStats {
  const past = sessions
    .filter((s) => s.type === type && s.status !== "upcoming" && inPeriod(s, config))
    .sort(byDate);
  const attended = past.filter((s) => s.status === "attended").length;
  const missed = past.length - attended;
  const rate = past.length > 0 ? (attended / past.length) * 100 : 0;

  let currentStreak = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    if (past[i].status !== "attended") break;
    currentStreak++;
  }

  const monthKey = config.asOf.slice(0, 7);
  const attendedThisMonth = past.filter(
    (s) => s.status === "attended" && s.date.startsWith(monthKey)
  ).length;

  const nextUpcoming = sessions
    .filter((s) => s.type === type && s.status === "upcoming")
    .sort(byDate)[0];

  return {
    scheduled: past.length,
    attended,
    missed,
    rate,
    badge: badgeFor(rate),
    currentStreak,
    attendedThisMonth,
    nextUpcoming,
  };
}

export function attendanceSummary(
  sessions: AttendanceSession[],
  config: AttendanceConfig
): AttendanceSummary {
  const meetings = typeStats(sessions, "meeting", config);
  const pks = typeStats(sessions, "pks", config);

  const scheduled = meetings.scheduled + pks.scheduled;
  const attended = meetings.attended + pks.attended;
  const overallRate = scheduled > 0 ? (attended / scheduled) * 100 : 0;

  const totalPoints =
    meetings.attended * config.pointsPerMeeting + pks.attended * config.pointsPerPks;

  const tiers = [...config.rewardTiers].sort((a, b) => a.points - b.points);
  const earnedTiers = tiers.filter((t) => totalPoints >= t.points);
  const nextTier = tiers.find((t) => totalPoints < t.points);
  const prevTierPoints = earnedTiers.length > 0 ? earnedTiers[earnedTiers.length - 1].points : 0;
  const pointsRemaining = nextTier ? nextTier.points - totalPoints : 0;
  const progressToNextPct = nextTier
    ? Math.min(100, (totalPoints / nextTier.points) * 100)
    : 100;

  const past = sessions.filter((s) => s.status !== "upcoming").sort(byDate);
  let longestStreak = 0;
  let run = 0;
  for (const session of past) {
    run = session.status === "attended" ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
  }

  const lastAttended = [...past].reverse().find((s) => s.status === "attended");

  const months = new Map<string, { attended: number; scheduled: number }>();
  for (const session of past) {
    const key = session.date.slice(0, 7);
    const bucket = months.get(key) ?? { attended: 0, scheduled: 0 };
    bucket.scheduled++;
    if (session.status === "attended") bucket.attended++;
    months.set(key, bucket);
  }
  const monthlyTrend: MonthTrend[] = [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-3)
    .map(([key, bucket]) => ({
      label: new Date(`${key}-01`).toLocaleDateString("en-US", { month: "short" }),
      attended: bucket.attended,
      scheduled: bucket.scheduled,
      rate: bucket.scheduled > 0 ? (bucket.attended / bucket.scheduled) * 100 : 0,
    }));

  return {
    meetings,
    pks,
    overallRate,
    overallBadge: badgeFor(overallRate),
    totalPoints,
    eligible: overallRate >= config.eligibilityMinRate,
    earnedTiers,
    nextTier,
    prevTierPoints,
    progressToNextPct,
    pointsRemaining,
    meetingsNeeded: nextTier ? Math.ceil(pointsRemaining / config.pointsPerMeeting) : 0,
    pksNeeded: nextTier ? Math.ceil(pointsRemaining / config.pointsPerPks) : 0,
    longestStreak,
    lastAttended,
    monthlyTrend,
  };
}

export function formatSessionDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
