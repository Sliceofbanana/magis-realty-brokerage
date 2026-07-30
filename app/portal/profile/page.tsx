"use client";

import Image from "next/image";
import { useState } from "react";
import { Phone, Mail, ShieldCheck, MessageSquare, CalendarPlus, X, Plus, Eye } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { interiors, portraits } from "@/lib/stockPhotos";

export default function ProfileAdminPage() {
  const [fullName, setFullName] = useState("Julianne V. Reyes");
  const [title, setTitle] = useState("Executive Broker");
  const [prcLicense, setPrcLicense] = useState("PRC-REB-0029341");
  const [dhsudReg, setDhsudReg] = useState("DHSUD-NCR-B-08/21-094");
  const [primaryOffice, setPrimaryOffice] = useState("BGC Corporate Center, Taguig");
  const [languages, setLanguages] = useState(["English", "Tagalog"]);
  const [bio, setBio] = useState(
    "With over 12 years of specialized experience in luxury residential real estate, Julianne has closed over $500M in transactions within the BGC and Makati districts. Known for her data-driven approach and meticulous attention to detail, she provides clients with exclusive off-market access and bespoke relocation services for high-net-worth individuals and multinational corporations."
  );
  const [saved, setSaved] = useState(false);

  function removeLanguage(lang: string) {
    setLanguages((prev) => prev.filter((l) => l !== lang));
  }

  return (
    <div>
      <PageHeader title="My Profile Management" />

      <Tabs
        tabs={[
          { id: "personal", label: "Personal Info" },
          { id: "social", label: "Social Media" },
          { id: "professional", label: "Professional Details" },
          { id: "preview", label: "Public Preview" },
        ]}
      >
        {(active) => {
          if (active === "social") {
            return (
              <div className="max-w-xl space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                {["LinkedIn", "Facebook", "Instagram"].map((platform) => (
                  <div key={platform}>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                      {platform} URL
                    </label>
                    <input
                      placeholder={`https://${platform.toLowerCase()}.com/julianne.reyes`}
                      className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            );
          }

          if (active === "professional") {
            return (
              <div className="max-w-xl space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Years of Experience
                  </label>
                  <input
                    defaultValue={12}
                    type="number"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Specializations
                  </label>
                  <input
                    defaultValue="Luxury Residential, Portfolio Investment"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
              </div>
            );
          }

          if (active === "preview") {
            return (
              <div className="max-w-md rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm">
                <Eye className="mx-auto text-gold-500" size={28} />
                <p className="mt-3 text-sm text-gray-500">
                  This is how {fullName.split(" ")[0]}&rsquo;s profile appears to
                  the public on the agents directory.
                </p>
                <Button href="/agents/clara-beaumont" variant="outline" className="mt-4">
                  View Public Profile
                </Button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                  <div className="relative h-40 w-full">
                    <Image
                      src={interiors.officeLounge}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 p-6">
                    <div className="-mt-16 flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white">
                        <Image
                          src={portraits.womanMoodyPortrait}
                          alt={fullName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-navy-900">{fullName}</p>
                        <p className="text-sm text-gray-500">
                          {title} &bull; Magis Realty Global
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSaved(true);
                        setTimeout(() => setSaved(false), 2000);
                      }}
                    >
                      {saved ? "Saved!" : "Save Changes"}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-navy-900">
                    <ShieldCheck size={18} className="text-gold-500" /> Identity &amp; Licenses
                  </h2>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Full Name" value={fullName} onChange={setFullName} />
                    <Field label="Position / Title" value={title} onChange={setTitle} />
                    <Field label="PRC License No." value={prcLicense} onChange={setPrcLicense} />
                    <Field label="DHSUD Registration No." value={dhsudReg} onChange={setDhsudReg} />
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                        Primary Office
                      </label>
                      <select
                        value={primaryOffice}
                        onChange={(e) => setPrimaryOffice(e.target.value)}
                        className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                      >
                        {["BGC Corporate Center, Taguig", "Ayala Tower, Makati", "IT Park, Cebu"].map(
                          (office) => (
                            <option key={office}>{office}</option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                        Languages Spoken
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {languages.map((lang) => (
                          <span
                            key={lang}
                            className="flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1.5 text-xs font-medium text-white"
                          >
                            {lang}
                            <button type="button" onClick={() => removeLanguage(lang)} aria-label={`Remove ${lang}`}>
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-full border border-dashed border-black/20 px-3 py-1.5 text-xs text-gray-500 hover:border-navy-900 hover:text-navy-900"
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                      Professional Biography
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 1000))}
                      rows={5}
                      maxLength={1000}
                      className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">
                      {bio.length} / 1000 characters
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-fit rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gold-600">
                  <Eye size={14} /> Live Preview
                  <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="overflow-hidden rounded-xl bg-navy-950 p-6 text-center text-white">
                  <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-white/40">
                    <Image
                      src={portraits.womanMoodyPortrait}
                      alt={fullName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-3 font-serif text-lg font-bold">{fullName}</p>
                  <p className="text-[11px] uppercase tracking-wide text-gold-400">{title}</p>
                </div>
                <div className="space-y-3 p-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-navy-700" />
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Phone</p>
                      <p className="font-semibold text-navy-900">+63 917 123 4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-navy-700" />
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Email</p>
                      <p className="font-semibold text-navy-900">j.reyes@magisrealty.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-navy-700" />
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">License</p>
                      <p className="font-semibold text-navy-900">{prcLicense}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 p-4 pt-0">
                  <Button size="sm" className="flex-1">
                    <MessageSquare size={14} /> Message
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <CalendarPlus size={14} /> Book
                  </Button>
                </div>
              </div>
            </div>
          );
        }}
      </Tabs>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
      />
    </div>
  );
}
