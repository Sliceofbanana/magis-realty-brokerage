"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";

export type CreateBlogPostResult = { error?: string; success?: boolean };

/** Creates a new blog post — requires the Manage Blog Content permission (Administrators and Marketing by default). */
export async function createBlogPostAction(
  _prevState: CreateBlogPostResult,
  formData: FormData
): Promise<CreateBlogPostResult> {
  let session;
  try {
    session = await requirePermission("MANAGE_BLOGS");
  } catch {
    return { error: "Not authorized." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const contentRaw = String(formData.get("content") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const readTime = String(formData.get("readTime") ?? "").trim();
  const pullQuote = String(formData.get("pullQuote") ?? "").trim();

  if (!title) return { error: "Title is required." };
  if (!excerpt) return { error: "Excerpt is required." };
  if (!category) return { error: "Category is required." };
  if (!contentRaw) return { error: "Content is required." };

  const content = contentRaw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const slug = await uniqueSlug(
    title,
    async (candidate) => (await prisma.blogPost.count({ where: { slug: candidate } })) > 0
  );

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title,
      excerpt,
      category,
      content,
      tags,
      image: image || null,
      readTime: readTime || null,
      pullQuote: pullQuote || null,
      authorId: session.user.id,
    },
  });

  revalidatePath("/portal/blogs");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);

  return { success: true };
}
