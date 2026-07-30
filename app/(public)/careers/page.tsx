import Image from "next/image";
import { Award, Users, TrendingUp, Compass, HeartHandshake, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SimpleForm, FormField } from "@/components/public/SimpleForm";
import { business, portraits } from "@/lib/stockPhotos";

export const metadata = { title: "Careers | Magis Realty & Brokerage" };

const stats = [
  ["250+", "Premium Listings"],
  ["₱2.4B+", "Transaction Volume"],
  ["12", "Years of Excellence"],
  ["150+", "Expert Brokers"],
] as const;

const cultureFeatures = [
  {
    icon: Award,
    title: "Unparalleled Resources",
    description: "Access to proprietary market data and elite marketing tools for every listing.",
  },
  {
    icon: Users,
    title: "Collaborative Ecosystem",
    description: "A community of high-performers who share insights and celebrate collective wins.",
  },
  {
    icon: TrendingUp,
    title: "Performance Incentives",
    description: "Competitive commission structures and exclusive rewards for our top-tier talent.",
  },
];

const openings = [
  {
    badge: "Full Time",
    tone: "navy" as const,
    location: "Remote / Hybrid",
    title: "Senior Real Estate Consultant",
    description:
      "Lead high-net-worth clients through luxury property acquisitions with expert advisory and market analysis.",
    experience: "5+ Years",
  },
  {
    badge: "New Opening",
    tone: "gold" as const,
    location: "Downtown Office",
    title: "Senior Marketing Specialist",
    description:
      "Develop editorial-grade digital campaigns and oversee brand presentation for premier listings.",
    experience: "3+ Years",
  },
  {
    badge: "Full Time",
    tone: "navy" as const,
    location: "Regional Portfolio",
    title: "Luxury Property Manager",
    description:
      "Oversee the operational excellence and tenant relations for a portfolio of premium residential assets.",
    experience: "4+ Years",
  },
];

const applicationFields: FormField[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
  {
    name: "expertise",
    label: "Area of Expertise",
    type: "select",
    options: ["Sales & Brokerage", "Marketing", "Property Management", "Operations"],
    span: "full",
  },
  {
    name: "portfolio",
    label: "LinkedIn Profile / Portfolio",
    type: "text",
    placeholder: "https://linkedin.com/in/...",
    span: "full",
    required: false,
  },
];

const badgeTone = {
  navy: "bg-navy-900 text-white",
  gold: "bg-gold-500 text-white",
};

export default function CareersPage() {
  return (
    <>
      <section className="bg-navy-950 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Career Opportunities
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
            Elevate the Standard of Modern Living.{" "}
            <span className="text-gold-400">Join Our Team.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/70">
            At Magis Realty, we don&rsquo;t just sell properties; we curate legacies. We
            are looking for visionary professionals to help us redefine high-end
            brokerage through architectural appreciation and unmatched client service.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="#openings" variant="gold">
              View Openings
            </Button>
            <Button href="#culture" variant="outline-light">
              Our Culture
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-black/5 bg-offwhite py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 text-center sm:grid-cols-4 sm:px-6 lg:px-8">
          {stats.map(([value, label]) => (
            <div key={label}>
              <p className="font-serif text-2xl font-bold text-navy-900">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="culture" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative h-72 overflow-hidden rounded-2xl sm:h-96">
            <Image
              src={business.teamCollaboration}
              alt="The Magis Realty team collaborating"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
              Built on a Foundation of Excellence
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Our culture is rooted in mutual respect and the relentless pursuit of
              quality. We provide an environment where expertise is celebrated, and
              growth is facilitated through mentorship and industry-leading technology.
            </p>
            <ul className="mt-6 space-y-5">
              {cultureFeatures.map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                    <feature.icon size={16} />
                  </span>
                  <div>
                    <p className="font-semibold text-navy-900">{feature.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-navy-950 p-8 text-white">
            <Compass className="absolute -right-2 -top-2 text-white/10" size={96} />
            <h3 className="relative font-serif text-xl font-bold">A Legacy of Quality</h3>
            <p className="relative mt-2 max-w-xs text-sm text-white/70">
              Join a firm that prioritizes architectural integrity and sustainable urban
              development in every transaction.
            </p>
          </div>
          <div className="relative h-56 overflow-hidden rounded-2xl sm:h-auto">
            <Image
              src={portraits.womanGrayBlazer}
              alt="A Magis Realty broker"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[280px_1fr]">
          <div className="rounded-2xl bg-gold-500 p-6 text-white">
            <HeartHandshake size={22} />
            <h3 className="mt-3 font-serif text-lg font-bold">Well-being First</h3>
            <p className="mt-2 text-sm text-white/90">
              Comprehensive health benefits, flexible remote options, and wellness
              retreats.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-900">
                Professional Mentorship
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Learn from industry veterans through our quarterly &lsquo;Legacy
                Series&rsquo; workshops.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                <GraduationCap size={18} />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-white">
                <Users size={18} />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="openings" className="bg-offwhite py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                Current Openings
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Find your next challenge in our curated list of opportunities.
              </p>
            </div>
            <div className="flex gap-3">
              <select className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-navy-900">
                <option>All Locations</option>
              </select>
              <select className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-navy-900">
                <option>All Departments</option>
              </select>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {openings.map((job) => (
              <div
                key={job.title}
                className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`rounded px-2 py-0.5 font-semibold uppercase tracking-wide ${badgeTone[job.tone]}`}
                    >
                      {job.badge}
                    </span>
                    <span className="text-gray-400">{job.location}</span>
                  </div>
                  <h3 className="mt-2 font-serif text-lg font-bold text-navy-900">
                    {job.title}
                  </h3>
                  <p className="mt-1 max-w-xl text-sm text-gray-600">{job.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-6">
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      Exp. Required
                    </p>
                    <p className="font-semibold text-navy-900">{job.experience}</p>
                  </div>
                  <Button href="/contact" size="sm">
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sky-100 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 rounded-2xl bg-white p-8 shadow-sm sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
              Don&rsquo;t see the right role?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              We are always looking for exceptional talent. Submit an open application
              and tell us how your unique skills can contribute to our mission of
              redefining the luxury real estate experience.
            </p>
            <div className="mt-6 flex flex-wrap gap-10 text-sm">
              <div>
                <p className="font-semibold text-navy-900">Direct Contact</p>
                <p className="mt-1 text-gray-500">talent@magisrealty.com</p>
              </div>
              <div>
                <p className="font-semibold text-navy-900">Office Hours</p>
                <p className="mt-1 text-gray-500">Mon &ndash; Fri, 9am &ndash; 6pm</p>
              </div>
            </div>
          </div>
          <SimpleForm
            fields={applicationFields}
            submitLabel="Send Open Application →"
            submitVariant="primary"
          />
        </div>
      </section>
    </>
  );
}
