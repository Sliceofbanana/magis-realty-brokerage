"use server";

import { PortalRole as PrismaPortalRole } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TeamMember } from "@/lib/types";

const roleToPortalRole: Record<PrismaPortalRole, TeamMember["role"]> = {
  ADMINISTRATOR: "Administrator",
  BROKER: "Broker",
  AGENT: "Agent",
  MARKETING: "Marketing",
};

/**
 * Real roster for the portal's birthday system (banner, modal, widget) — who
 * is actually in it is driven by each user's own `User.birthDate`, set from
 * Settings > General, not by a hardcoded fixture.
 */
export async function getBirthdayTeamAction(): Promise<TeamMember[]> {
  // Staff names, photos and birth dates — signed-in team members only.
  const session = await auth();
  if (!session?.user) return [];

  const rows = await prisma.user.findMany({
    where: { status: "ACTIVE", birthDate: { not: null } },
    select: { id: true, name: true, position: true, photo: true, birthDate: true, role: true },
    orderBy: { name: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    position: r.position ?? "",
    photo: r.photo,
    birthDate: r.birthDate!.toISOString().slice(0, 10),
    role: roleToPortalRole[r.role],
  }));
}
