import type { Prisma } from "@prisma/client";
import type { BlogPost } from "@/lib/types";
import { exteriors } from "@/lib/stockPhotos";

export const blogPostWithAuthor = {
  author: { select: { name: true } },
} satisfies Prisma.BlogPostInclude;

type BlogPostWithAuthor = Prisma.BlogPostGetPayload<{ include: typeof blogPostWithAuthor }>;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

/** Maps a Prisma BlogPost row to the shared front-end `BlogPost` shape. */
export function toBlogPost(p: BlogPostWithAuthor): BlogPost {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    author: p.author?.name ?? "Magis Realty Editorial",
    date: dateFormatter.format(p.publishedAt),
    readTime: p.readTime ?? "5 min read",
    image: p.image || exteriors.glassOfficeTowers,
    content: p.content,
    pullQuote: p.pullQuote ?? "",
    tags: p.tags,
  };
}
