import { prisma } from "@/lib/prisma";
import { blogPostWithAuthor, toBlogPost } from "@/lib/adapters/blog";
import { BlogsAdminView } from "@/components/portal/BlogsAdminView";

export const dynamic = "force-dynamic";

export default async function BlogsAdminPage() {
  const rows = await prisma.blogPost.findMany({
    include: blogPostWithAuthor,
    orderBy: { publishedAt: "desc" },
  });
  const posts = rows.map(toBlogPost);

  return <BlogsAdminView posts={posts} />;
}
