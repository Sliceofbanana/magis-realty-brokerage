import { prisma } from "@/lib/prisma";
import { propertyWithRelations, toProperty } from "@/lib/adapters/property";
import { PropertiesFilterView } from "@/components/public/PropertiesFilterView";

export const metadata = { title: "Properties | Magis Realty & Brokerage" };
export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const rows = await prisma.property.findMany({
    include: propertyWithRelations,
    orderBy: { createdAt: "desc" },
  });
  const properties = rows.map(toProperty);

  return <PropertiesFilterView properties={properties} />;
}
