import type { Prisma } from "@prisma/client";
import type { Property } from "@/lib/types";
import { exteriors } from "@/lib/stockPhotos";

const statusLabel: Record<string, Property["status"]> = {
  FOR_SALE: "For Sale",
  SOLD: "Sold",
  PENDING: "Pending",
  EXCLUSIVE: "Exclusive",
};

const typeLabel: Record<string, Property["type"]> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
};

const regionLabel: Record<string, Property["region"]> = {
  NORTH: "North Cebu",
  CENTRAL: "Central Cebu",
  SOUTH: "South Cebu",
};

export const propertyWithRelations = {
  images: true,
  agent: { include: { agentProfile: true } },
} satisfies Prisma.PropertyInclude;

type PropertyWithRelations = Prisma.PropertyGetPayload<{ include: typeof propertyWithRelations }>;

/** Maps a Prisma Property row to the shared front-end `Property` shape. */
export function toProperty(p: PropertyWithRelations): Property {
  const sortedImages = [...p.images].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    collection: p.collection ?? "",
    status: statusLabel[p.status] ?? "For Sale",
    type: typeLabel[p.type] ?? "Residential",
    region: regionLabel[p.region] ?? "Central Cebu",
    location: p.location,
    address: p.address,
    price: Number(p.price),
    pricePerSqft: p.pricePerSqft ? Number(p.pricePerSqft) : 0,
    beds: p.beds,
    baths: p.baths,
    area: p.area,
    parking: p.parking,
    verified: p.verified,
    archived: p.archived,
    image: sortedImages[0]?.url || exteriors.glassOfficeTowers,
    gallery: sortedImages.slice(1).map((img) => img.url),
    description: p.description,
    amenities: p.amenities,
    // Falls back to the real user id if the agent has no public profile yet
    // (e.g. Administrator/Marketing accounts) — matches the mock data's use
    // of the agent-directory slug in lib/data/agents.ts.
    agentId: p.agent.agentProfile?.slug ?? p.agent.id,
  };
}
