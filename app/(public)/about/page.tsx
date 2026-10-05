import Image from "next/image";
import { Flag, Eye, Gem, ShieldCheck, LineChart, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeveloperStrip } from "@/components/public/DeveloperStrip";
import { RevealOnScroll, RevealStagger, RevealItem } from "@/components/public/RevealOnScroll";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { business, interiors } from "@/lib/stockPhotos";

export const metadata = { title: "About Us | Magis Realty & Brokerage" };

const founder = {
  name: "Mary Angelly M. Ruiz",
  photo: "/images/founder.webp",
  facebook: "https://www.facebook.com/propertyincebu",
};

const pillars = [
  {
    icon: Flag,
    title: "Our Mission",
    description:
      "To provide world-class real estate brokerage services by combining deep local expertise with a global standard of professional integrity and personal attention.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To be the most trusted and preferred property partner in the Philippines, known for cultivating long-term wealth and thriving communities through strategic investments.",
  },
  {
    icon: Gem,
    title: "Our Values",
    description: null,
    list: ["Integrity Above All", "Radical Client-Centricity", "Continuous Growth (Magis)"],
  },
];

const advantages = [
  {
    icon: ShieldCheck,
    title: "Uncompromising Integrity",
    description:
      "We operate with radical transparency. No hidden fees, no opaque contracts — just honest, data-driven advice for your investment.",
  },
  {
    icon: LineChart,
    title: "Deep Market Expertise",
    description:
      "Our brokers are neighborhood specialists who understand the micro-trends that drive property appreciation in the local market.",
  },
  {
    icon: Users,
    title: "Client-Centricity",
    description:
      "We don't just sell property; we curate experiences and build portfolios tailored to your specific life goals and risk appetite.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative flex h-[420px] items-end sm:h-[620px]">
        <Image
          src={business.teamMeetingTable}
          alt="The Magis Realty leadership team"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/60" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Our Mission
          </p>
          <h1 className="mt-2 max-w-2xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
            Elevating Lives Through{" "}
            <span className="text-gold-400">Exceptional Real Estate.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/80">
            We are committed to delivering unparalleled service, rooted in the
            spirit of &ldquo;Magis&rdquo;&mdash;doing more, being better, and
            striving for excellence in every transaction.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/contact" variant="primary">
              Contact Our Agents
            </Button>
            <Button href="/properties" variant="outline-light">
              View Portfolio
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <RevealOnScroll>
            <h2 className="font-serif text-3xl font-bold text-navy-900">
              Our Journey in Philippine Real Estate
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Founded in the heart of Metro Manila, Magis Realty &amp; Brokerage
              emerged from a vision to redefine the local property landscape.
              What began as a boutique advisory has evolved into a premier
              full-service brokerage, serving the discerning needs of investors
              and families across the Philippines.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Our name, &ldquo;Magis,&rdquo; reflects our Ignatian heritage of
              striving for the more&mdash;the greater good in all of our
              professional dealings. In a rapidly evolving market, we have
              remained steadfast in our commitment to transparency, technical
              expertise, and an unwavering focus on our client&rsquo;s
              long-term prosperity.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-black/10 pt-6">
              {[
                ["15+", "Years Experience"],
                ["₱12B+", "Property Value Sold"],
                ["500+", "Families Rehomed"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-serif text-2xl font-bold text-gold-600">{value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15} className="relative">
            <div className="relative h-80 overflow-hidden rounded-2xl bg-gray-100 sm:h-96">
              <Image
                src={business.highFiveDuo}
                alt="Magis Realty consultants at work"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <Card className="absolute -bottom-6 left-4 right-4 bg-navy-950 p-5 text-white sm:left-8 sm:right-auto sm:w-72">
              <p className="font-serif text-sm italic leading-relaxed">
                &ldquo;Excellence is not a destination, but a continuous
                pursuit of &lsquo;the more&rsquo; for our clients.&rdquo;
              </p>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-gold-400">
                &mdash; Founder&rsquo;s Note
              </p>
            </Card>
          </RevealOnScroll>
        </div>
      </section>

      <section className="bg-offwhite py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <h2 className="text-center font-serif text-3xl font-bold text-navy-900">
              The Pillars of Magis
            </h2>
          </RevealOnScroll>
          <RevealStagger className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <RevealItem key={pillar.title}>
              <Card className="bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                  <pillar.icon size={20} />
                </span>
                <h3 className="mt-4 font-serif text-lg font-bold text-navy-900">
                  {pillar.title}
                </h3>
                {pillar.description && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {pillar.description}
                  </p>
                )}
                {pillar.list && (
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                    {pillar.list.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="bg-navy-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              Our Founder &middot; Cebu, PH
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              The Expert Behind <span className="text-gold-400">the Vision.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70">
              <strong className="font-semibold text-white">{founder.name}</strong> founded
              Magis Realty &amp; Brokerage on a simple belief&mdash;&ldquo;Magis&rdquo;:
              doing more, being better, and striving for excellence in every
              transaction.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
              Every client, every listing, and every closing carries that same
              commitment to transparency, technical expertise, and long-term
              prosperity for the families and investors we serve.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/contact" variant="gold">Talk to Our Team</Button>
              <a
                href={founder.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
              >
                <SocialIcon platform="facebook" size={16} /> Follow on Facebook
              </a>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15} className="relative mx-auto w-full max-w-md lg:mr-0">
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-gold-500/30 via-navy-900 to-navy-950 shadow-2xl shadow-black/40">
              <Image
                src={founder.photo}
                alt={`Portrait of ${founder.name}, founder of Magis Realty & Brokerage`}
                fill
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-linear-to-t from-navy-950/90 via-navy-950/0 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-serif text-2xl font-bold">{founder.name}</p>
                <p className="mt-1 text-sm text-gold-400">Founder, Magis Realty &amp; Brokerage</p>
              </div>
            </div>
            <div className="absolute -left-2 top-8 rounded-2xl border border-white/10 bg-navy-950/85 px-4 py-3 shadow-lg backdrop-blur sm:-left-6">
              <p className="font-serif text-xl font-bold text-gold-400">Magis</p>
              <p className="text-[11px] leading-tight text-white/70">
                to serve you more.
                <br />
                Buy. Sell. Rent.
              </p>
            </div>
            <div className="absolute -right-2 bottom-24 rounded-2xl border border-white/10 bg-navy-950/85 px-4 py-3 shadow-lg backdrop-blur sm:-right-6">
              <p className="font-serif text-xl font-bold text-gold-400">Cebu</p>
              <p className="text-[11px] leading-tight text-white/70">
                North, Central
                <br />
                &amp; South
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <DeveloperStrip />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <RevealOnScroll>
            <h2 className="font-serif text-3xl font-bold text-navy-900">
              The Magis Advantage
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Choosing a broker is more than a transaction; it&rsquo;s a
              strategic partnership. Here&rsquo;s why Magis remains the
              standard for real estate in the Philippines.
            </p>
            <ul className="mt-8 space-y-6">
              {advantages.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-navy-700">
                    <item.icon size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-navy-900">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15} className="relative grid grid-cols-2 gap-4">
            <div className="relative h-72 overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={interiors.brightLivingRoom}
                alt="Curated luxury interior finish"
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="relative h-32 overflow-hidden rounded-2xl bg-gold-500" />
              <div className="relative h-36 overflow-hidden rounded-2xl bg-gray-100">
                <Image
                  src={interiors.whiteModernKitchen}
                  alt="Curated luxury interior detail"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <Card className="absolute -bottom-6 left-4 bg-navy-950 p-4 text-white">
              <p className="font-serif text-2xl font-bold text-gold-400">98%</p>
              <p className="text-[11px] uppercase tracking-wide text-white/70">
                Broker Network Rank
              </p>
            </Card>
          </RevealOnScroll>
        </div>
      </section>

      <section className="bg-sky-100 py-20">
        <RevealOnScroll className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-navy-900">
            Ready to find your Magis?
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Whether you&rsquo;re looking for your dream home or a high-yield
            investment, our team of experts is ready to guide you home.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/contact">Schedule a Consultation</Button>
            <Button href="/properties" variant="outline">
              Browse Properties
            </Button>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
