"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/users";
import { uniqueSlug } from "@/lib/slug";
import { teamToneFor } from "@/lib/teamTones";

export type TeamOption = { id: string; name: string; tone: string; dot: string; border: string };

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
    teams: teams.map((t) => ({ id: t.id, name: t.name, tone: t.tone, dot: t.dot, border: t.border })),
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

export type CreateTeamResult = { error?: string; success?: boolean };

/** Admin-only: creates a new leaderboard team. */
export async function createTeamAction(name: string, tone: string): Promise<CreateTeamResult> {
  await requireAdmin();

  const trimmed = name.trim();
  if (!trimmed) return { error: "Team name is required." };

  const id = await uniqueSlug(
    trimmed,
    async (candidate) => (await prisma.leaderboardTeam.count({ where: { id: candidate } })) > 0
  );
  const { dot, border } = teamToneFor(tone);

  await prisma.leaderboardTeam.create({ data: { id, name: trimmed, tone, dot, border } });

  revalidatePath("/portal/teams");
  revalidatePath("/portal/leaderboard");
  return { success: true };
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
