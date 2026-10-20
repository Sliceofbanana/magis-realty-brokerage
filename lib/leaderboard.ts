import { prisma } from "@/lib/prisma";
import { currentQuotaPeriods } from "@/lib/quotaPeriods";
import type { LeaderboardAgent, LeaderboardTeam, QuotaPeriod, QuotaPeriodId } from "@/lib/types";

export type LeaderboardData = {
  periods: QuotaPeriod[];
  teams: LeaderboardTeam[];
  agents: LeaderboardAgent[];
};

const UNASSIGNED_TEAM: LeaderboardTeam = {
  id: "unassigned",
  name: "No Team",
  tone: "gray",
  dot: "bg-gray-400",
  border: "border-l-gray-300",
};

const toDbPeriod = (id: QuotaPeriodId) => id.toUpperCase() as "WEEKLY" | "MONTHLY" | "QUARTERLY";
const day = (s: string) => new Date(`${s}T00:00:00.000Z`);
const zeroed = (): Record<QuotaPeriodId, number> => ({ weekly: 0, monthly: 0, quarterly: 0 });

/**
 * Real leaderboard data: every active Agent/Broker, their assigned quota for
 * the *current* weekly/monthly/quarterly cycle, and what they've achieved —
 * the sum of their commission records closed inside each cycle.
 */
export async function loadLeaderboard(currentUserId: string | null): Promise<LeaderboardData> {
  const periods = currentQuotaPeriods();

  const [users, teams, periodRows, ...achievedByPeriod] = await prisma.$transaction([
    prisma.user.findMany({
      where: { status: "ACTIVE", role: { in: ["AGENT", "BROKER"] } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        photo: true,
        primaryOffice: true,
        agentProfile: { select: { region: true, teamId: true } },
      },
    }),
    prisma.leaderboardTeam.findMany({ orderBy: { name: "asc" } }),
    prisma.quotaPeriod.findMany({
      where: { OR: periods.map((p) => ({ periodId: toDbPeriod(p.id), start: day(p.start) })) },
      include: { quotas: true },
    }),
    ...periods.map((p) =>
      prisma.commissionRecord.groupBy({
        by: ["agentId"],
        where: { closedDate: { gte: day(p.start), lte: day(p.end) } },
        _sum: { earned: true },
        orderBy: { agentId: "asc" },
      })
    ),
  ]);

  const agents: LeaderboardAgent[] = users.map((u) => {
    const quota = zeroed();
    const achieved = zeroed();
    periods.forEach((p, i) => {
      const row = periodRows.find((r) => r.periodId === toDbPeriod(p.id) && r.start.toISOString().slice(0, 10) === p.start);
      quota[p.id] = Number(row?.quotas.find((q) => q.agentId === u.id)?.quotaAmount ?? 0);
      achieved[p.id] = Number(achievedByPeriod[i].find((a) => a.agentId === u.id)?._sum?.earned ?? 0);
    });
    return {
      id: u.id,
      name: u.name,
      photo: u.photo,
      region: u.agentProfile?.region ?? u.primaryOffice ?? "—",
      teamId: u.agentProfile?.teamId ?? UNASSIGNED_TEAM.id,
      isYou: u.id === currentUserId,
      quota,
      achieved,
    };
  });

  return {
    periods,
    teams: [
      ...teams.map((t) => ({ id: t.id, name: t.name, tone: t.tone as LeaderboardTeam["tone"], dot: t.dot, border: t.border })),
      UNASSIGNED_TEAM,
    ],
    agents,
  };
}
