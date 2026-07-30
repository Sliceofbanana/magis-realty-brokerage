"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, Clock } from "lucide-react";
import { blogPosts } from "@/lib/data/blog";
import { BlogCard } from "@/components/public/BlogCard";
import { NewsletterForm } from "@/components/public/NewsletterForm";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 4;

export default function BlogPage() {
  const [category, setCategory] = useState("All Stories");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);
  const categories = ["All Stories", ...new Set(rest.map((p) => p.category))];
  const topics = [...new Set(blogPosts.flatMap((p) => p.tags))].slice(0, 6);
  const trending = blogPosts.slice(1, 4);

  const filtered = useMemo(() => {
    return rest.filter((p) => {
      const matchesCategory = category === "All Stories" || p.category === category;
      const matchesQuery =
        !query || p.title.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [rest, category, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <section className="relative flex h-[440px] items-end sm:h-[480px]">
        <Image src={featured.image} alt={featured.title} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-navy-950/10" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <span className="inline-block rounded bg-navy-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Featured Insight
          </span>
          <h1 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            {featured.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/80">{featured.excerpt}</p>
          <Link
            href={`/blog/${featured.slug}`}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-400 hover:text-gold-300"
          >
            Read Featured Article <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <div className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <nav className="flex flex-wrap gap-6 text-xs font-semibold uppercase tracking-wide">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
                className={
                  category === c
                    ? "border-b-2 border-gold-500 pb-1 text-navy-900"
                    : "pb-1 text-gray-400 hover:text-navy-900"
                }
              >
                {c}
              </button>
            ))}
          </nav>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search insights..."
              className="w-full rounded-lg border border-black/10 bg-gray-50 py-2 pl-9 pr-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-offwhite py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
          <div>
            {paged.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center text-sm text-gray-500">
                No articles match your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {paged.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-navy-950 p-6 text-white">
              <h2 className="font-serif text-xl font-bold">The Magis Letter</h2>
              <p className="mt-2 text-sm text-white/70">
                Receive weekly curated market insights, exclusive off-market
                listings, and luxury lifestyle news directly to your inbox.
              </p>
              <div className="mt-4">
                <NewsletterForm />
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-navy-900">Trending Insights</h2>
              <div className="mt-4 space-y-4">
                {trending.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex gap-3 group"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <Image src={post.image} alt={post.title} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-snug text-navy-900 group-hover:text-gold-600">
                        {post.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={11} /> {post.readTime}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-navy-900">Topics</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <section className="bg-sky-100 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-navy-900">
            Expertise Beyond Brokerage.
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Our agents aren&rsquo;t just salespeople&mdash;they are market
            analysts and investment strategists. Get a personalized
            consultation today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/agents">Connect With an Agent</Button>
            <Button href="/properties" variant="outline">
              View Property Guide
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
