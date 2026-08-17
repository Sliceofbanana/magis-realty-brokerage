import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/public/BlogCard";
import { NewsletterForm } from "@/components/public/NewsletterForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { interiors, exteriors } from "@/lib/stockPhotos";
import { prisma } from "@/lib/prisma";
import { blogPostWithAuthor, toBlogPost } from "@/lib/adapters/blog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug }, select: { title: true } });
  return { title: post ? `${post.title} | Magis Realty & Brokerage` : "Article Not Found" };
}

export default async function BlogDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await prisma.blogPost.findUnique({ where: { slug }, include: blogPostWithAuthor });
  if (!row) notFound();
  const post = toBlogPost(row);

  const otherRows = await prisma.blogPost.findMany({
    where: { id: { not: post.id } },
    include: blogPostWithAuthor,
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
  const others = otherRows.map(toBlogPost);
  const trending = others;
  const related = others;
  const [firstHalf, ...restParagraphs] = post.content;
  const [midParagraph, ...tailParagraphs] = restParagraphs;

  return (
    <>
      <section className="relative flex h-[380px] items-end sm:h-[460px]">
        <Image src={post.image} alt={post.title} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-navy-950/10" />
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
          <Badge tone="navy">{post.category}</Badge>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-white/80">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-white">
              {post.author
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <span>{post.author}</span>
            <span>&middot;</span>
            <span>{post.date}</span>
            <span>&middot;</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
          <article className="min-w-0 space-y-5 text-sm leading-relaxed text-gray-600">
            <p>{firstHalf}</p>
            {midParagraph && (
              <>
                <h2 className="font-serif text-2xl font-bold text-navy-900">
                  The Convergence of Luxury and Ecology
                </h2>
                <p>{midParagraph}</p>
                <blockquote className="border-l-4 border-gold-500 bg-gold-100/50 px-5 py-4 font-serif text-lg italic text-navy-900">
                  &ldquo;{post.pullQuote}&rdquo;
                </blockquote>
              </>
            )}

            <h3 className="font-serif text-lg font-bold text-navy-900">
              Key Benefits for the Modern Investor:
            </h3>
            <ul className="space-y-2">
              {[
                "Operational Efficiency: Advanced HVAC systems and smart glass technology reduce utility costs by up to 30%.",
                "Resale Resilience: LEED-certified properties have shown a 10-15% higher resale value in the secondary market.",
                "Wellness Integration: Features like hospital-grade air filtration and natural light optimization improve resident well-being.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="relative h-64 overflow-hidden rounded-2xl">
              <Image
                src={interiors.penthouseLivingRoomView}
                alt="A signature residence featuring floor-to-ceiling glazing"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-center text-xs text-gray-400">
              A signature residence featuring floor-to-ceiling high-performance glazing.
            </p>

            {tailParagraphs.map((para) => (
              <p key={para}>{para}</p>
            ))}

            <div className="flex flex-wrap gap-2 border-t border-black/10 pt-6">
              {post.tags.map((tag) => (
                <Badge key={tag} tone="navy">
                  {tag}
                </Badge>
              ))}
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-navy-950 p-6 text-white">
              <h2 className="font-serif text-lg font-bold">The Magis Letter</h2>
              <p className="mt-2 text-sm text-white/70">
                Curated insights on high-end real estate, architecture, and
                luxury lifestyle delivered to your inbox bi-weekly.
              </p>
              <div className="mt-4">
                <NewsletterForm />
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-navy-900">Trending Insights</h2>
              <div className="mt-4 space-y-4">
                {trending.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gold-600">
                      {p.category}
                    </p>
                    <p className="text-sm font-semibold leading-snug text-navy-900 group-hover:text-gold-600">
                      {p.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={11} /> {p.readTime}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/properties"
              className="group relative block h-56 overflow-hidden rounded-2xl"
            >
              <Image
                src={exteriors.darkModernHouseDuskAlt}
                alt="Exclusive listing"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gold-400">
                  Exclusive Listing
                </p>
                <p className="mt-1 font-serif text-base font-bold">The Magis Residences at Azure Bay</p>
                <p className="mt-2 text-xs font-semibold text-gold-300">Learn More →</p>
              </div>
            </Link>
          </aside>
        </div>
      </div>

      <section className="bg-offwhite py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b border-black/10 pb-4">
            <h2 className="font-serif text-2xl font-bold text-navy-900">Related Insights</h2>
            <Link href="/blog" className="flex items-center gap-1 text-sm font-semibold text-navy-900 hover:text-gold-600">
              View All Blog <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sky-100 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-navy-900">
            Seeking Expert Investment Counsel?
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Our bespoke consultancy services bridge the gap between
            architectural vision and investment reality. Let us guide your
            next acquisition.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/agents">Connect With an Agent</Button>
            <Button href="/contact" variant="outline">
              Download Portfolio
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
