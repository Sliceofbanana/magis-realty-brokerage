import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Target, LineChart, ArrowRight, TrendingUp, Building2, BadgeCheck, Star } from "lucide-react";
import { HomeHero } from "@/components/public/HomeHero";
import { DeveloperStrip } from "@/components/public/DeveloperStrip";
import { PropertyCard } from "@/components/public/PropertyCard";
import { AgentCard } from "@/components/public/AgentCard";
import { BlogCard } from "@/components/public/BlogCard";
import { TestimonialCarousel } from "@/components/public/TestimonialCarousel";
import { NewsletterForm } from "@/components/public/NewsletterForm";
import { RevealOnScroll, RevealStagger, RevealItem } from "@/components/public/RevealOnScroll";
import { StatCard } from "@/components/ui/StatCard";
import { prisma } from "@/lib/prisma";
import { propertyWithRelations, toProperty } from "@/lib/adapters/property";
import { agentWithProfile, toAgent } from "@/lib/adapters/agent";
import { toTestimonial } from "@/lib/adapters/testimonial";
import { blogPosts } from "@/lib/data/blog";
import { business, exteriors } from "@/lib/stockPhotos";
import { formatCurrency } from "@/lib/format";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Unrivaled Expertise",
    description:
      "Over 20 years of navigating the complex terrain of luxury real estate and commercial portfolios.",
  },
  {
    icon: Target,
    title: "Client-Centric Philosophy",
    description:
      "Every search is a partnership. We prioritize your long-term goals and architectural preferences.",
  },
  {
    icon: LineChart,
    title: "Data-Driven Insights",
    description:
      "Proprietary market analysis providing our clients with a competitive edge in pricing and timing.",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // $transaction (not Promise.all) so this page needs one pooled connection
  // instead of six held open at once — Supabase's session-mode pooler has a
  // small shared connection budget, and this page already caused one of the
  // "database error" incidents from concurrent-connection exhaustion.
  const [featuredRows, eliteRows, testimonialRows, soldAgg, verifiedAgentCount, ratingAgg] = await prisma.$transaction([
    prisma.property.findMany({
      where: { archived: false, status: { not: "SOLD" } },
      include: propertyWithRelations,
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.user.findMany({
      where: { agentProfile: { bio: { isEmpty: false } } },
      include: agentWithProfile,
      orderBy: { name: "asc" },
      take: 4,
    }),
    prisma.testimonial.findMany(),
    prisma.property.aggregate({
      where: { status: "SOLD" },
      _sum: { price: true },
      _count: true,
    }),
    prisma.agentProfile.count({ where: { publicVerified: true } }),
    prisma.agentProfile.aggregate({
      where: { reviewCount: { gt: 0 } },
      _avg: { rating: true },
    }),
  ]);
  const featured = featuredRows.map(toProperty);
  const elite = eliteRows.map(toAgent);
  const testimonials = testimonialRows.map(toTestimonial);
  const insights = blogPosts.slice(0, 2);
  const showTrustStats = soldAgg._count > 0 || verifiedAgentCount > 0;
  const trustStats = [
    {
      icon: TrendingUp,
      label: "Total Value Closed",
      value: formatCurrency(Number(soldAgg._sum.price ?? 0)),
    },
    {
      icon: Building2,
      label: "Properties Sold",
      value: soldAgg._count,
    },
    {
      icon: BadgeCheck,
      label: "Verified Agents",
      value: verifiedAgentCount,
    },
    {
      icon: Star,
      label: "Average Client Rating",
      value: ratingAgg._avg.rating ? `${ratingAgg._avg.rating.toFixed(1)} / 5` : "—",
    },
  ];

  return (
    <>
      <HomeHero />

      {/* Trust Stats */}
      {showTrustStats && (
        <RevealOnScroll className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {trustStats.map((stat) => (
              <StatCard key={stat.label} icon={<stat.icon size={20} />} label={stat.label} value={stat.value} />
            ))}
          </div>
        </RevealOnScroll>
      )}

      {/* Curated Collections */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <RevealOnScroll className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-navy-900">
              Curated Collections
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Tailored property selections designed to meet specific lifestyle
              and investment objectives.
            </p>
          </div>
          <Link
            href="/properties"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-navy-900 hover:text-gold-600 sm:flex"
          >
            Explore All Categories <ArrowRight size={14} />
          </Link>
        </RevealOnScroll>

        <RevealStagger className="mt-8 grid grid-cols-1 gap-4 sm:h-105 sm:grid-cols-2">
          <RevealItem>
          <Link
            href="/properties?type=Residential"
            className="group relative h-64 overflow-hidden rounded-2xl sm:h-full"
          >
            <Image
              src={exteriors.whiteVillaPoolDay}
              alt="Luxury residential collection"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent" />
            <div className="absolute bottom-5 left-5 text-white">
              <p className="font-serif text-xl font-bold">Luxury Residential</p>
              <p className="text-sm text-white/80">The pinnacle of private living</p>
            </div>
          </Link>
          </RevealItem>
          <RevealItem>
          <div className="grid grid-cols-1 gap-4 sm:h-full sm:grid-rows-2">
            <Link
              href="/properties?type=Commercial"
              className="group relative h-32 overflow-hidden rounded-2xl sm:h-full"
            >
              <Image
                src={exteriors.glassOfficeTowers}
                alt="Strategic commercial collection"
                fill
                sizes="(min-width: 640px) 25vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-serif text-lg font-bold">Strategic Commercial</p>
                <p className="text-xs text-white/80">Premium business hubs</p>
              </div>
            </Link>
            <Link
              href="/portfolio"
              className="group relative h-32 overflow-hidden rounded-2xl sm:h-full"
            >
              <Image
                src={exteriors.farmlandSunset}
                alt="Land and investment collection"
                fill
                sizes="(min-width: 640px) 25vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-serif text-lg font-bold">Land &amp; Investment</p>
                <p className="text-xs text-white/80">Securing future growth</p>
              </div>
            </Link>
          </div>
          </RevealItem>
        </RevealStagger>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="bg-offwhite py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                New Listings
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-navy-900">
                Featured Properties
              </h2>
            </RevealOnScroll>
            <RevealStagger className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((property) => (
                <RevealItem key={property.id}>
                  <PropertyCard property={property} />
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </section>
      )}

      {/* Magis Standard */}
      <section className="bg-navy-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <RevealOnScroll>
            <h2 className="font-serif text-3xl font-bold">
              The Magis Standard: Excellence Without Compromise
            </h2>
            <ul className="mt-8 space-y-6">
              {pillars.map((pillar) => (
                <li key={pillar.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold-400">
                    <pillar.icon size={20} />
                  </span>
                  <div>
                    <p className="font-semibold">{pillar.title}</p>
                    <p className="mt-1 text-sm text-white/70">{pillar.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15} className="relative h-80 overflow-hidden rounded-2xl lg:h-96">
            <Image
              src={business.handshake}
              alt="Magis Realty agents in consultation"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </RevealOnScroll>
        </div>
      </section>

      <DeveloperStrip />

      {/* Elite Agents */}
      {elite.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <RevealOnScroll className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-navy-900">
                You May Contact Our Agents
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                The experts behind our most successful acquisitions.
              </p>
            </div>
            <Link
              href="/agents"
              className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-navy-900 hover:text-gold-600 sm:flex"
            >
              View All Team <ArrowRight size={14} />
            </Link>
          </RevealOnScroll>
          <RevealStagger className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {elite.map((agent) => (
              <RevealItem key={agent.id}>
                <AgentCard agent={agent} />
              </RevealItem>
            ))}
          </RevealStagger>
        </section>
      )}

      {/* Insights */}
      <section className="bg-offwhite py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <h2 className="text-center font-serif text-3xl font-bold text-navy-900">
              Insights &amp; Market Trends
            </h2>
          </RevealOnScroll>
          <RevealStagger className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {insights.map((post) => (
              <RevealItem key={post.id}>
                <BlogCard post={post} />
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-sky-100 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <RevealOnScroll>
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-gold-600">
                Testimonials
              </p>
              <h2 className="mt-2 text-center font-serif text-3xl font-bold text-navy-900">
                What Clients Say
              </h2>
            </RevealOnScroll>
            <div className="mt-10">
              <TestimonialCarousel testimonials={testimonials} />
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="bg-white py-20">
        <RevealOnScroll className="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-navy-900">
            The Magis Newsletter
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Receive exclusive invitations to off-market listings and bespoke
            market analysis directly to your inbox.
          </p>
          <NewsletterForm variant="light" className="mt-6" />
        </RevealOnScroll>
      </section>
    </>
  );
}
