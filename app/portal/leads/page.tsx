import { prisma } from "@/lib/prisma";
import { leadWithProperty, toLead } from "@/lib/adapters/lead";
import { LeadsAdminView } from "@/components/portal/LeadsAdminView";

export const dynamic = "force-dynamic";

export default async function LeadsAdminPage() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [rows, properties, newThisWeek, sourceGroups] = await Promise.all([
    prisma.lead.findMany({
      include: leadWithProperty,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.lead.groupBy({ by: ["source"], _count: { _all: true } }),
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
    <LeadsAdminView leads={leads} properties={properties} newThisWeek={newThisWeek} sources={sources} />
  );
}
