import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { leadWithProperty, toLead } from "@/lib/adapters/lead";
import { listTeamsWithAgents, type TeamAgentRow } from "@/lib/actions/teams";
import { LeadsAdminView } from "@/components/portal/LeadsAdminView";

export const dynamic = "force-dynamic";

export default async function LeadsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isAdmin = session.user.role === "ADMINISTRATOR";
  // Leads hold visitors' contact details: administrators see the whole
  // pipeline, everyone else only the leads assigned to them.
  const leadScope = isAdmin ? {} : { agentId: session.user.id };

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [rows, properties, newThisWeek, sourceGroups, agentsData] = await Promise.all([
    prisma.lead.findMany({
      where: leadScope,
      include: leadWithProperty,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.findMany({
      where: { archived: false },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.lead.count({ where: { ...leadScope, createdAt: { gte: weekAgo } } }),
    prisma.lead.groupBy({ by: ["source"], where: leadScope, _count: { _all: true } }),
    isAdmin ? listTeamsWithAgents() : Promise.resolve<{ teams: []; agents: TeamAgentRow[] }>({ teams: [], agents: [] }),
  ]);

  const leads = rows.map(toLead);

  const total = sourceGroups.reduce((sum, g) => sum + g._count._all, 0);
  const sources = sourceGroups
    .map((g) => ({
      label: g.source || "Direct / Unspecified",
      value: total > 0 ? (g._count._all / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <LeadsAdminView
      leads={leads}
      properties={properties}
      newThisWeek={newThisWeek}
      sources={sources}
      agents={agentsData.agents}
      isAdmin={!!isAdmin}
      initialQuery={q}
    />
  );
}
