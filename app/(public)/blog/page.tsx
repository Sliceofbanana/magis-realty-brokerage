import { prisma } from "@/lib/prisma";
import { blogPostWithAuthor, toBlogPost } from "@/lib/adapters/blog";
import { BlogDirectoryView } from "@/components/public/BlogDirectoryView";

export const metadata = { title: "Blog | Magis Realty & Brokerage" };
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const rows = await prisma.blogPost.findMany({
    include: blogPostWithAuthor,
    orderBy: { publishedAt: "desc" },
  });
  const posts = rows.map(toBlogPost);

  return <BlogDirectoryView posts={posts} />;
}
