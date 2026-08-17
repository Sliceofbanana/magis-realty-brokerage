import { prisma } from "@/lib/prisma";
import { propertyWithRelations, toProperty } from "@/lib/adapters/property";
import { ListingsAdminView } from "@/components/portal/ListingsAdminView";

export const dynamic = "force-dynamic";

export default async function ListingsAdminPage() {
  const [rows, agents] = await Promise.all([
    prisma.property.findMany({
      include: propertyWithRelations,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE", role: { in: ["ADMINISTRATOR", "BROKER", "AGENT"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
  ]);
  const properties = rows.map(toProperty);

  return <ListingsAdminView properties={properties} agents={agents} />;
}
