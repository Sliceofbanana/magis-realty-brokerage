"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { BlogPost } from "@/lib/types";
import { PageHeader } from "@/components/portal/PageHeader";
import { CreateBlogPostForm } from "@/components/portal/CreateBlogPostForm";

const PAGE_SIZE = 5;

export function BlogsAdminView({ posts }: { posts: BlogPost[] }) {
  const [page, setPage] = useState(1);

  if (posts.length === 0) {
    return (
      <div>
        <PageHeader
          title="Brokerage Insights"
          description="Stay updated with the latest market trends, company announcements, and expert tips to excel in your real estate career."
          action={<CreateBlogPostForm />}
        />
        <div className="rounded-2xl border-2 border-dashed border-black/10 p-16 text-center text-gray-400">
          <BookOpen size={32} className="mx-auto" />
          <p className="mt-3 font-serif text-lg font-bold text-navy-900">No posts yet</p>
          <p className="mt-1 text-sm">Publish your first article to see it here and on the public blog.</p>
        </div>
      </div>
    );
  }

  const [featured, second, ...rest] = posts;
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const pagedRest = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Brokerage Insights"
        description="Stay updated with the latest market trends, company announcements, and expert tips to excel in your real estate career."
        action={<CreateBlogPostForm />}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Link
          href={`/blog/${featured.slug}`}
          className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm sm:col-span-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="relative h-52 sm:h-full">
              <Image src={featured.image} alt={featured.title} fill className="object-cover" />
              <span className="absolute left-3 top-3 rounded bg-navy-900 px-2 py-1 text-[10px] font-semibold uppercase text-white">
                Featured
              </span>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                {featured.category}
              </p>
              <p className="mt-2 font-serif text-lg font-bold leading-snug text-navy-900 group-hover:text-gold-600">
                {featured.title}
              </p>
              <p className="mt-2 line-clamp-3 text-sm text-gray-500">{featured.excerpt}</p>
              <p className="mt-4 text-xs text-gray-400">{featured.author} &bull; {featured.date}</p>
            </div>
          </div>
        </Link>

        {second && (
          <Link
            href={`/blog/${second.slug}`}
            className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
          >
            <div className="relative h-32 w-full">
              <Image src={second.image} alt={second.title} fill className="object-cover" />
              <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-navy-900">
                {second.category}
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold leading-snug text-navy-900 group-hover:text-gold-600">
                {second.title}
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-gray-500">{second.excerpt}</p>
              <p className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                <Clock size={11} /> {second.readTime} &bull; {second.author}
              </p>
            </div>
          </Link>
        )}
      </div>

      {pagedRest.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pagedRest.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
            >
              <div className="relative h-40 w-full">
                <Image src={post.image} alt={post.title} fill className="object-cover" />
                <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-navy-900">
                  {post.category}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold leading-snug text-navy-900 group-hover:text-gold-600">
                  {post.title}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-gray-500">{post.excerpt}</p>
                <p className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} /> {post.readTime} &bull; {post.author}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-navy-900 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                page === p ? "bg-navy-900 text-white" : "text-navy-900 hover:bg-navy-900/5"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-navy-900 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
