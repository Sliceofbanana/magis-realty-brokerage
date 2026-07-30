import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Target, LineChart, ArrowRight } from "lucide-react";
import { HomeHero } from "@/components/public/HomeHero";
import { DeveloperStrip } from "@/components/public/DeveloperStrip";
import { PropertyCard } from "@/components/public/PropertyCard";
import { AgentCard } from "@/components/public/AgentCard";
import { BlogCard } from "@/components/public/BlogCard";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { NewsletterForm } from "@/components/public/NewsletterForm";
import { properties } from "@/lib/data/properties";
import { agents, testimonials } from "@/lib/data/agents";
import { blogPosts } from "@/lib/data/blog";
import { business, exteriors } from "@/lib/stockPhotos";

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

export default function HomePage() {
  const featured = properties.slice(0, 3);
  const elite = agents.slice(0, 4);
  const insights = blogPosts.slice(0, 2);

  return (
    <>
      <HomeHero />

      {/* Curated Collections */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
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
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:h-105 sm:grid-cols-2">
          <Link
            href="/properties"
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
          <div className="grid grid-cols-1 gap-4 sm:h-full sm:grid-rows-2">
            <Link
              href="/properties"
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
              href="/properties"
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
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-offwhite py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              New Listings
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-navy-900">
              Featured Properties
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* Magis Standard */}
      <section className="bg-navy-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
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
          </div>
          <div className="relative h-80 overflow-hidden rounded-2xl lg:h-96">
            <Image
              src={business.handshake}
              alt="Magis Realty agents in consultation"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <DeveloperStrip />

      {/* Elite Agents */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
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
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {elite.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>

      {/* Insights */}
      <section className="bg-offwhite py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold text-navy-900">
            Insights &amp; Market Trends
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {insights.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-sky-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gold-600">
            Testimonials
          </p>
          <h2 className="mt-2 text-center font-serif text-3xl font-bold text-navy-900">
            What Clients Say
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-navy-900">
            The Magis Newsletter
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Receive exclusive invitations to off-market listings and bespoke
            market analysis directly to your inbox.
          </p>
          <NewsletterForm variant="light" className="mt-6" />
        </div>
      </section>
    </>
  );
}
