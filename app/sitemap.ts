import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Same rationale as robots.ts — no incoming request to read a Host header
// from here, so this reuses the same required production origin.
const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

const staticRoutes = [
  { path: "/", priority: 1, frequency: "weekly" as const },
  { path: "/about", priority: 0.7, frequency: "monthly" as const },
  { path: "/services", priority: 0.8, frequency: "monthly" as const },
  { path: "/properties", priority: 0.9, frequency: "daily" as const },
  { path: "/portfolio", priority: 0.7, frequency: "monthly" as const },
  { path: "/agents", priority: 0.7, frequency: "weekly" as const },
  { path: "/blog", priority: 0.6, frequency: "weekly" as const },
  { path: "/careers", priority: 0.5, frequency: "monthly" as const },
  { path: "/faqs", priority: 0.4, frequency: "monthly" as const },
  { path: "/contact", priority: 0.6, frequency: "yearly" as const },
  { path: "/privacy-policy", priority: 0.2, frequency: "yearly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, agents, posts] = await Promise.all([
    prisma.property.findMany({
      where: { archived: false },
      select: { slug: true, updatedAt: true },
    }),
    prisma.user.findMany({
      where: { agentProfile: { bio: { isEmpty: false } } },
      select: { agentProfile: { select: { slug: true } }, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      select: { slug: true, publishedAt: true },
    }),
  ]);

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      changeFrequency: route.frequency,
      priority: route.priority,
    })),
    ...properties.map((p) => ({
      url: `${baseUrl}/properties/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...agents
      .filter((a) => a.agentProfile?.slug)
      .map((a) => ({
        url: `${baseUrl}/agents/${a.agentProfile!.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
