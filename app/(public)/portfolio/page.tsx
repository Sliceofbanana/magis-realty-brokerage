import Image from "next/image";
import { Camera, Globe2, HeartHandshake, ShieldCheck, Building2, Users2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { propertyWithRelations, toProperty } from "@/lib/adapters/property";
import { formatCurrency } from "@/lib/format";
import { PortfolioGrid } from "@/components/public/PortfolioGrid";
import { RevealOnScroll, RevealStagger, RevealItem } from "@/components/public/RevealOnScroll";
import { exteriors } from "@/lib/stockPhotos";

export const metadata = { title: "Investment Portfolio | Magis Realty & Brokerage" };
export const dynamic = "force-dynamic";

const capabilities = [
  {
    icon: Camera,
    title: "Professional Listing Photography",
    description:
      "Every active listing is presented with a full photo gallery, so buyers and investors can evaluate a property in depth before ever scheduling a visit.",
  },
  {
    icon: ShieldCheck,
    title: "Licensed, Verified Brokers",
    description:
      "Every transaction is handled by a PRC-licensed broker under a DHSUD-registered brokerage — not a freelance agent operating without oversight.",
  },
  {
    icon: Globe2,
    title: "Reach Across Cebu",
    description:
      "Active coverage across North, Central, and South Cebu, with brokers who know the specific micro-market of each listing, not just the province.",
  },
  {
    icon: HeartHandshake,
    title: "Unlimited After-Sales Support",
    description:
      "Support doesn't end at closing — from title transfer questions to tenant handover, our brokers stay reachable long after the deal is done.",
  },
];

export default async function PortfolioPage() {
  const [rows, activeCount, agentCount] = await Promise.all([
    prisma.property.findMany({
      where: { archived: false },
      include: propertyWithRelations,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where: { archived: false } }),
    prisma.user.count({ where: { agentProfile: { bio: { isEmpty: false } } } }),
  ]);

  const properties = rows.map(toProperty);
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);

  const stats = [
    { value: formatCurrency(totalValue), label: "Combined Active Portfolio Value" },
    { value: String(activeCount), label: "Active Listings" },
    { value: "3", label: "Regions Served in Cebu" },
    { value: String(agentCount), label: "Licensed Brokers & Agents" },
  ];

  return (
    <>
      <section className="relative flex h-[380px] items-end sm:h-[480px]">
        <Image
          src={exteriors.glassOfficeTowers}
          alt="Magis Realty investment portfolio"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/65" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Track Record &amp; Transaction Portfolio
          </p>
          <h1 className="mt-2 max-w-2xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
            The Magis Realty Investment Portfolio
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/80">
            A live look at what our brokerage is actively bringing to market
            across Cebu — for investors, owners, and institutional buyers.
          </p>
        </div>
      </section>

      <section className="border-b border-black/5 bg-offwhite py-14">
        <RevealStagger className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <RevealItem key={stat.label}>
            <div className="text-center lg:text-left">
              <p className="font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                {stat.label}
              </p>
            </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <RevealOnScroll className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-navy-900">
            Portfolio Grid
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Every asset currently active in our portfolio, filterable by type
            and status.
          </p>
        </RevealOnScroll>
        <PortfolioGrid properties={properties} />
      </section>

      <section className="bg-navy-950 py-20 text-white">
        <RevealOnScroll className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-gold-400">
            <Building2 size={20} />
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold">
            Featured Transactions
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            We&apos;re building out this section as we close notable deals —
            check back soon for in-depth case studies.
          </p>
          <Card className="mt-8 border-white/10 bg-white/5 p-10 text-center">
            <p className="font-serif text-lg font-bold text-white">
              Case studies coming soon
            </p>
            <p className="mt-2 text-sm text-white/60">
              In the meantime, browse the live portfolio grid above or talk to
              an agent about a specific asset.
            </p>
          </Card>
        </RevealOnScroll>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <RevealOnScroll className="mb-10">
          <h2 className="font-serif text-3xl font-bold text-navy-900">
            How We Work
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            What partnering with Magis Realty actually looks like — no
            inflated claims, just what we deliver on every deal.
          </p>
        </RevealOnScroll>
        <RevealStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap) => (
            <RevealItem key={cap.title}>
            <Card className="bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                <cap.icon size={20} />
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-navy-900">
                {cap.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {cap.description}
              </p>
            </Card>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      <section className="bg-sky-100 py-20">
        <RevealStagger className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <RevealItem>
          <Card className="flex flex-col items-start bg-white p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
              <Users2 size={20} />
            </span>
            <h3 className="mt-4 font-serif text-xl font-bold text-navy-900">
              For Owners &amp; Investors
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Looking to list, sell, or grow a property portfolio in Cebu?
              Get a straightforward valuation and strategy consultation from
              our team.
            </p>
            <Button href="/contact" className="mt-6">
              Request a Property Assessment
            </Button>
          </Card>
          </RevealItem>
          <RevealItem>
          <Card className="flex flex-col items-start bg-white p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
              <Building2 size={20} />
            </span>
            <h3 className="mt-4 font-serif text-xl font-bold text-navy-900">
              For Agents &amp; Brokers
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Join a licensed brokerage built on transparency and
              after-sales support that doesn&apos;t stop at closing.
            </p>
            <Button href="/careers" variant="outline" className="mt-6">
              Explore Career Opportunities
            </Button>
          </Card>
          </RevealItem>
        </RevealStagger>
      </section>
    </>
  );
}
