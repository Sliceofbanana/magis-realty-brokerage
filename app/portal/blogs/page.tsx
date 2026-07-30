"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Clock, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { blogPosts } from "@/lib/data/blog";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";

export default function BlogsAdminPage() {
  const [page, setPage] = useState(1);
  const [featured, second, ...rest] = blogPosts;

  return (
    <div>
      <PageHeader
        title="Brokerage Insights"
        description="Stay updated with the latest market trends, company announcements, and expert tips to excel in your real estate career."
        action={
          <Button>
            <Plus size={16} /> Add New Blog
          </Button>
        }
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
              <p className="mt-4 text-xs text-gray-400">Admin &bull; {featured.date}</p>
            </div>
          </div>
        </Link>

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
              <Clock size={11} /> {second.readTime} &bull; Admin
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.slice(0, 5).map((post) => (
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
                <Clock size={11} /> {post.readTime} &bull; Admin
              </p>
            </div>
          </Link>
        ))}

        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/10 p-8 text-center text-gray-400">
          <BookOpen size={26} />
          <p className="font-serif text-base font-bold text-navy-900">Explore the Archive</p>
          <p className="text-xs">Access the complete library of training modules and market data.</p>
          <button type="button" className="mt-1 text-xs font-semibold text-gold-600 hover:underline">
            Visit Archive
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-navy-900"
        >
          <ChevronLeft size={16} />
        </button>
        {[1, 2, 3].map((p) => (
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
          onClick={() => setPage((p) => p + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-navy-900"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
