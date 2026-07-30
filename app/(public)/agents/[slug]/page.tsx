import Image from "next/image";
import { notFound } from "next/navigation";
import { Mail, Phone, Building2, Home } from "lucide-react";
import { agents, getAgentBySlug } from "@/lib/data/agents";
import { testimonials } from "@/lib/data/agents";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { SimpleForm, FormField } from "@/components/public/SimpleForm";

export function generateStaticParams() {
  return agents.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  return { title: agent ? `${agent.name} | Magis Realty & Brokerage` : "Agent Not Found" };
}

const consultationFields: FormField[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "John Doe", span: "full" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@luxury.com", span: "full" },
  {
    name: "interest",
    label: "Interest Area",
    type: "select",
    options: ["Buying Property", "Selling Property", "Leasing", "Investment Advisory"],
    span: "full",
  },
  {
    name: "message",
    label: "Your Message",
    type: "textarea",
    placeholder: "Tell us about your requirements...",
    span: "full",
    required: false,
  },
];

const specialtyIcons = [Building2, Home];

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  if (!agent) notFound();

  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative h-80 lg:h-[480px]">
          <Image src={agent.photo} alt={agent.name} fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-4 py-12 sm:px-10 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
            {agent.title}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-navy-900">{agent.name}</h1>
          <p className="mt-4 max-w-md font-serif text-lg italic leading-relaxed text-gray-600">
            &ldquo;{agent.quote}&rdquo;
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm font-medium text-navy-900">
            <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-gold-600">
              <Mail size={16} /> Email
            </a>
            <a href={`tel:${agent.phone}`} className="flex items-center gap-2 hover:text-gold-600">
              <Phone size={16} /> Contact
            </a>
            <span className="flex items-center gap-2 text-gray-400">
              <SocialIcon platform="linkedin" size={16} /> LinkedIn
            </span>
          </div>
        </div>
      </section>

      <section className="bg-navy-950 py-10 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-4 text-center sm:px-6 lg:px-8">
          {[
            [`${agent.yearsExperience}+`, "Years of Experience"],
            [agent.propertiesSoldValue, "Properties Sold (PHP)"],
            [agent.clientSatisfaction, "Client Satisfaction"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-serif text-3xl font-bold text-gold-400 sm:text-4xl">{value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/70">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="border-l-4 border-gold-500 pl-4 font-serif text-2xl font-bold text-navy-900">
              Curating Extraordinary Living
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">
              {agent.bio.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {agent.specialties.map((s, i) => {
                const Icon = specialtyIcons[i % specialtyIcons.length];
                return (
                  <div key={s.title} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-3 font-serif text-lg font-bold text-navy-900">{s.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{s.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-navy-900">Schedule a Consultation</h3>
            <p className="mt-1 text-xs text-gray-500">
              {agent.name.split(" ")[0]} typically responds within 2 business hours.
            </p>
            <SimpleForm
              fields={consultationFields}
              submitLabel="Request Private Meeting"
              submitVariant="primary"
              className="mt-4 grid-cols-1"
              successTitle="Request received"
              successMessage="We've notified the agent — expect a response within 2 business hours."
            />
            <p className="mt-4 text-center text-[11px] text-gray-400">
              Strictly confidential advisory.
            </p>
          </aside>
        </div>
      </section>

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
    </>
  );
}
