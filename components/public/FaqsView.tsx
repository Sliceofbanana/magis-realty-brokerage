"use client";

import { useMemo, useState } from "react";
import { Search, Wallet, Tag, KeyRound, TrendingUp, ShieldCheck, Phone, Mail } from "lucide-react";
import { FaqCategory } from "@/lib/types";
import { Accordion } from "@/components/ui/Accordion";
import { SimpleForm, FormField } from "@/components/public/SimpleForm";
import { Card } from "@/components/ui/Card";

const icons = { wallet: Wallet, tag: Tag, key: KeyRound, "trending-up": TrendingUp };

const contactFields: FormField[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
  {
    name: "message",
    label: "How can we help?",
    type: "textarea",
    placeholder: "Your message...",
    span: "full",
    required: false,
  },
];

export function FaqsView({
  categories,
  contactAction,
}: {
  categories: FaqCategory[];
  contactAction: (values: Record<string, string>) => Promise<{ error?: string } | void>;
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [query, setQuery] = useState("");

  const active = categories.find((c) => c.id === activeCategory) ?? categories[0];

  const searchResults = useMemo(() => {
    if (!query) return null;
    const q = query.toLowerCase();
    return categories.flatMap((cat) =>
      cat.items
        .filter((item) => item.question.toLowerCase().includes(q))
        .map((item) => ({ ...item, category: cat.label }))
    );
  }, [categories, query]);

  if (!active) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-navy-900">No FAQs yet.</h1>
        <p className="mt-2 text-sm text-gray-500">Check back soon.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
          How can we assist you today?
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Find answers to common questions about buying, selling, and
          investing in premium real estate with Magis.
        </p>
        <div className="relative mx-auto mt-6 max-w-lg">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for questions (e.g. 'mortgage', 'closing costs')..."
            className="w-full rounded-xl border border-black/10 bg-white py-3.5 pl-11 pr-4 text-sm text-navy-900 shadow-sm focus:border-navy-900 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-offwhite pb-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
          <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
            {categories.map((cat) => {
              const Icon = icons[cat.icon as keyof typeof icons];
              const isActive = activeCategory === cat.id && !query;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setQuery("");
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors lg:w-full ${
                    isActive
                      ? "bg-navy-900 text-white"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {cat.label}
                </button>
              );
            })}
          </nav>

          <div>
            {searchResults ? (
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy-900">
                  Search Results ({searchResults.length})
                </h2>
                <div className="mt-4">
                  <Accordion items={searchResults} />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="flex items-center gap-2 border-b border-black/10 pb-3 font-serif text-2xl font-bold text-navy-900">
                  {(() => {
                    const Icon = icons[active.icon as keyof typeof icons];
                    return Icon ? <Icon size={22} className="text-gold-500" /> : null;
                  })()}
                  {active.label} {active.id === "buying" ? "Properties" : active.id === "selling" ? "Your Property" : active.id === "leasing" ? "& Management" : "Real Estate"}
                </h2>

                {active.id === "leasing" && (
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[240px_1fr]">
                    <div className="rounded-2xl bg-gold-500 p-5 text-white">
                      <ShieldCheck size={22} />
                      <h3 className="mt-3 font-serif text-lg font-bold">Tenant Screening</h3>
                      <p className="mt-2 text-sm text-white/90">
                        We ensure peace of mind by conducting rigorous
                        background, credit, and employment checks on all
                        prospective tenants.
                      </p>
                    </div>
                    <Accordion items={active.items} />
                  </div>
                )}

                {active.id === "investment" && (
                  <>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {[
                        ["Avg. ROI", "8.2% - 12%"],
                        ["Appreciation", "+15% YoY"],
                        ["Portfolio Size", "$450M+"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-cream-200 p-5 text-center">
                          <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
                          <p className="mt-1 font-serif text-xl font-bold text-navy-900">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Accordion items={active.items} />
                    </div>
                  </>
                )}

                {active.id !== "leasing" && active.id !== "investment" && (
                  <div className="mt-6">
                    <Accordion items={active.items} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="bg-sky-100 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-navy-900">
              Still have questions?
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Our advisors are available 24/7 to provide expert guidance on
              your real estate journey. No question is too small for our team.
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gold-600">
                  <Phone size={16} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Call Us</p>
                  <p className="font-semibold text-navy-900">+1 (800) MAGIS-RE</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gold-600">
                  <Mail size={16} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Email Us</p>
                  <p className="font-semibold text-navy-900">concierge@magisrealty.com</p>
                </div>
              </div>
            </div>
          </div>
          <Card className="bg-white p-6">
            <SimpleForm
              fields={contactFields}
              submitLabel="Send Message"
              action={contactAction}
            />
          </Card>
        </div>
      </section>
    </>
  );
}
