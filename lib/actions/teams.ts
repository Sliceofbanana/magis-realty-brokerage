"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/users";

export type TeamOption = { id: string; name: string; tone: string };

export type TeamAgentRow = {
  agentProfileId: string;
  userId: string;
  name: string;
  photo: string | null;
  role: string;
  teamId: string | null;
};

export type TeamsData = {
  teams: TeamOption[];
  agents: TeamAgentRow[];
};

/** Admin-only: every team plus every agent (with their current team, if any). */
export async function listTeamsWithAgents(): Promise<TeamsData> {
  await requireAdmin();

  const [teams, profiles] = await Promise.all([
    prisma.leaderboardTeam.findMany({ orderBy: { name: "asc" } }),
    prisma.agentProfile.findMany({
      include: { user: { select: { id: true, name: true, photo: true, role: true, status: true } } },
      where: { user: { status: "ACTIVE" } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return {
    teams: teams.map((t) => ({ id: t.id, name: t.name, tone: t.tone })),
    agents: profiles.map((p) => ({
      agentProfileId: p.id,
      userId: p.user.id,
      name: p.user.name,
      photo: p.user.photo,
      role: p.user.role,
      teamId: p.teamId,
    })),
  };
}

export type SetTeamResult = { error?: string; success?: boolean };

/** Admin-only: assigns (or clears, with teamId=null) an agent's team. */
export async function setAgentTeamAction(agentProfileId: string, teamId: string | null): Promise<SetTeamResult> {
  await requireAdmin();

  if (teamId) {
    const team = await prisma.leaderboardTeam.findUnique({ where: { id: teamId } });
    if (!team) return { error: "Team not found." };
  }

  await prisma.agentProfile.update({ where: { id: agentProfileId }, data: { teamId } });

  revalidatePath("/portal/teams");
  revalidatePath("/portal/leaderboard");
  return { success: true };
}
