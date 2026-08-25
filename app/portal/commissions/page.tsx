import { prisma } from "@/lib/prisma";
import { commissionRecordInclude, toTransactionRow } from "@/lib/adapters/commission";
import { commissionReleaseSummary } from "@/lib/commissions";
import { CommissionsAdminView } from "@/components/portal/CommissionsAdminView";

export const dynamic = "force-dynamic";

export default async function CommissionsAdminPage() {
  const [records, agents, properties] = await Promise.all([
    prisma.commissionRecord.findMany({
      include: commissionRecordInclude,
      orderBy: { closedDate: "desc" },
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE", role: { in: ["ADMINISTRATOR", "BROKER", "AGENT"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
    prisma.property.findMany({
      where: { archived: false },
      orderBy: { title: "asc" },
      select: { id: true, title: true, price: true },
    }),
  ]);

  const transactions = records.map((r) => {
    const released = r.releases.reduce((sum, rel) => sum + Number(rel.amount), 0);
    return toTransactionRow(r, released);
  });

  const summary = commissionReleaseSummary(
    records.map((r) => ({
      id: r.id,
      property: r.property?.title ?? r.propertyLabel,
      closedDate: r.closedDate.toISOString().slice(0, 10),
      earned: Number(r.earned),
      releases: r.releases.map((rel) => ({
        id: rel.id,
        date: rel.date.toISOString().slice(0, 10),
        amount: Number(rel.amount),
        note: rel.note ?? undefined,
      })),
    }))
  );

  return (
    <CommissionsAdminView
      transactions={transactions}
      totalEarned={summary.totalEarned}
      remaining={summary.remaining}
      agents={agents}
      properties={properties.map((p) => ({ id: p.id, title: p.title, price: Number(p.price) }))}
    />
  );
}
