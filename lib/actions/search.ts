"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type PortalSearchResult = {
  properties: { id: string; title: string; location: string }[];
  leads: { id: string; name: string; email: string }[];
};

const EMPTY: PortalSearchResult = { properties: [], leads: [] };

/** Backs the portal topbar's search box — matched against listing title/location and lead name/email. */
export async function searchPortalAction(query: string): Promise<PortalSearchResult> {
  const session = await auth();
  if (!session?.user) return EMPTY;

  const q = query.trim();
  if (q.length < 2) return EMPTY;

  const [properties, leads] = await Promise.all([
    prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, location: true },
      take: 5,
    }),
    prisma.lead.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true },
      take: 5,
    }),
  ]);

  return { properties, leads };
}
