import Image from "next/image";
import { Home, Key, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { exteriors, interiors } from "@/lib/stockPhotos";

export const metadata = { title: "Services | Magis Realty & Brokerage" };

const services = [
  {
    icon: Home,
    title: "Buy",
    image: exteriors.contemporaryHouseFence,
    description:
      "From your first condo unit to a family lot back home, our brokers match you to properties across Cebu that fit your budget, timeline, and long-term plans — with every listing verified before it reaches you.",
    points: [
      "Verified listings across North, Central, and South Cebu",
      "Financing and reservation guidance, including for OFW buyers abroad",
      "Site visits and video walkthroughs for overseas clients",
    ],
    cta: { href: "/properties", label: "Browse Listings" },
  },
  {
    icon: Key,
    title: "Sell",
    image: interiors.penthouseLivingRoomView,
    description:
      "We price, market, and negotiate your property to close at fair market value — handling paperwork, buyer screening, and viewings so you're not managing the sale on top of everything else.",
    points: [
      "Market valuation before you list",
      "Professional listing photos and marketing",
      "Licensed brokers handling negotiation and closing documents",
    ],
    cta: { href: "/contact", label: "Get a Valuation" },
  },
  {
    icon: Building2,
    title: "Rent",
    image: exteriors.suburbanHouseDay,
    description:
      "Whether you're placing a tenant in a property you own or looking for a place to move into, we handle tenant screening, lease terms, and the handover — for both residential and commercial spaces.",
    points: [
      "Tenant screening for property owners",
      "Lease terms reviewed before you sign",
      "Residential and commercial spaces",
    ],
    cta: { href: "/agents", label: "Talk to an Agent" },
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="relative flex h-[380px] items-end sm:h-[480px]">
        <Image
          src={exteriors.whiteVillaPoolDay}
          alt="A Magis Realty property in Cebu"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/60" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            What We Do
          </p>
          <h1 className="mt-2 max-w-2xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
            Buy. Sell. <span className="text-gold-400">Rent.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/80">
            Cebu&apos;s trusted brokerage for OFWs, investors &amp; families —
            with unlimited after-sales support at every stage.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="flex flex-col overflow-hidden bg-white p-0">
              <div className="relative h-48">
                <Image
                  src={service.image}
                  alt={`${service.title} with Magis Realty`}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                  <service.icon size={20} />
                </span>
                <h2 className="mt-4 font-serif text-xl font-bold text-navy-900">
                  {service.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {service.description}
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button href={service.cta.href} variant="outline" className="w-full">
                    {service.cta.label}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-navy-950 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-gold-400">
            <ShieldCheck size={20} />
          </span>
          <p className="font-serif text-2xl font-bold">
            Licensed brokers, unlimited after-sales support
          </p>
          <p className="max-w-xl text-sm text-white/70">
            Every transaction is handled by a PRC-licensed broker under a
            DHSUD-registered brokerage — support doesn&apos;t end at closing.
          </p>
          <p className="text-xs uppercase tracking-wide text-white/50">
            PRC License No. 0020102 &nbsp;&nbsp; DHSUD Reg No. B-01/19-0204
          </p>
          <Button href="/contact" className="mt-2">
            Start a Conversation
          </Button>
        </div>
      </section>
    </>
  );
}
