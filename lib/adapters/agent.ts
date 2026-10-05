import type { Prisma } from "@prisma/client";
import type { Agent } from "@/lib/types";

export const agentWithProfile = {
  agentProfile: true,
} satisfies Prisma.UserInclude;

/**
 * The one rule for who may appear on the public site: an administrator has
 * listed them, they're still an active account, and the card has the content
 * it needs to render (a photo and a bio). Every public agent query uses this.
 */
export const publicAgentWhere = {
  status: "ACTIVE",
  photo: { not: null },
  agentProfile: { publicListed: true, bio: { isEmpty: false } },
} satisfies Prisma.UserWhereInput;

type UserWithAgentProfile = Prisma.UserGetPayload<{ include: typeof agentWithProfile }>;

/** Maps a Prisma User+AgentProfile row to the shared front-end `Agent` shape. */
export function toAgent(u: UserWithAgentProfile): Agent {
  const profile = u.agentProfile;
  return {
    id: u.id,
    slug: profile?.slug ?? u.id,
    name: u.name,
    title: u.position ?? "",
    quote: profile?.quote ?? "",
    photo: u.photo ?? "",
    email: u.email,
    phone: u.phone ?? "",
    yearsExperience: profile?.yearsExperience ?? 0,
    propertiesSoldValue: profile?.propertiesSoldValue ?? "—",
    clientSatisfaction: profile?.clientSatisfaction ?? "—",
    bio: profile?.bio ?? [],
    specialties: (profile?.specialties as { title: string; description: string }[] | null) ?? [],
    rating: profile?.rating ?? 0,
    reviews: profile?.reviewCount ?? 0,
    specialization: profile?.specialization ?? "",
    activeListings: profile?.activeListings ?? 0,
    topPerformer: profile?.topPerformer ?? false,
    verified: profile?.publicVerified ?? false,
  };
}
