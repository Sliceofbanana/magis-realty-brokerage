import { prisma } from "@/lib/prisma";
import { propertyWithRelations, toProperty } from "@/lib/adapters/property";
import { PropertiesFilterView } from "@/components/public/PropertiesFilterView";

export const metadata = { title: "Properties | Magis Realty & Brokerage" };
export const dynamic = "force-dynamic";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; type?: string }>;
}) {
  const params = await searchParams;
  const rows = await prisma.property.findMany({
    where: { archived: false },
    include: propertyWithRelations,
    orderBy: { createdAt: "desc" },
  });
  const properties = rows.map(toProperty);

  return (
    <PropertiesFilterView
      properties={properties}
      initialLocation={params.location}
      initialType={params.type}
    />
  );
}
