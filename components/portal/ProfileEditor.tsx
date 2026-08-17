"use client";

import { useState } from "react";
import { Phone, Mail, ShieldCheck, MessageSquare, CalendarPlus, X, Plus, Eye } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabDef } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { updateProfileAction } from "@/lib/actions/profile";

const officeOptions = ["BGC Corporate Center, Taguig", "Ayala Tower, Makati", "IT Park, Cebu"];

export type ProfileEditorUser = {
  name: string;
  position: string | null;
  primaryOffice: string | null;
  phone: string | null;
  email: string;
  photo: string | null;
};

export type ProfileEditorAgentProfile = {
  slug: string;
  prcLicense: string | null;
  dhsudRegistration: string | null;
  languages: string[];
  bio: string[];
  yearsExperience: number | null;
  specialization: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
};

export function ProfileEditor({
  user,
  agentProfile,
}: {
  user: ProfileEditorUser;
  agentProfile: ProfileEditorAgentProfile | null;
}) {
  const [fullName, setFullName] = useState(user.name);
  const [title, setTitle] = useState(user.position ?? "");
  const [primaryOffice, setPrimaryOffice] = useState(user.primaryOffice ?? officeOptions[0]);

  const [prcLicense, setPrcLicense] = useState(agentProfile?.prcLicense ?? "");
  const [dhsudReg, setDhsudReg] = useState(agentProfile?.dhsudRegistration ?? "");
  const [languages, setLanguages] = useState<string[]>(agentProfile?.languages ?? []);
  const [newLanguage, setNewLanguage] = useState("");
  const [bio, setBio] = useState((agentProfile?.bio ?? []).join("\n\n"));
  const [yearsExperience, setYearsExperience] = useState(agentProfile?.yearsExperience ?? 0);
  const [specialization, setSpecialization] = useState(agentProfile?.specialization ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(agentProfile?.linkedinUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(agentProfile?.facebookUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(agentProfile?.instagramUrl ?? "");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addLanguage() {
    const trimmed = newLanguage.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages((prev) => [...prev, trimmed]);
    }
    setNewLanguage("");
  }

  function removeLanguage(lang: string) {
    setLanguages((prev) => prev.filter((l) => l !== lang));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const result = await updateProfileAction({
      name: fullName,
      position: title,
      primaryOffice,
      prcLicense,
      dhsudRegistration: dhsudReg,
      languages,
      bio,
      yearsExperience,
      specialization,
      linkedinUrl,
      facebookUrl,
      instagramUrl,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs: TabDef[] = [
    { id: "personal", label: "Personal Info" },
    ...(agentProfile
      ? [
          { id: "social", label: "Social Media" },
          { id: "professional", label: "Professional Details" },
          { id: "preview", label: "Public Preview" },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader title="My Profile Management" />

      <Tabs tabs={tabs}>
        {(active) => {
          if (active === "social" && agentProfile) {
            return (
              <div className="max-w-xl space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                {[
                  { platform: "LinkedIn", value: linkedinUrl, set: setLinkedinUrl },
                  { platform: "Facebook", value: facebookUrl, set: setFacebookUrl },
                  { platform: "Instagram", value: instagramUrl, set: setInstagramUrl },
                ].map(({ platform, value, set }) => (
                  <div key={platform}>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                      {platform} URL
                    </label>
                    <input
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={`https://${platform.toLowerCase()}.com/yourname`}
                      className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            );
          }

          if (active === "professional" && agentProfile) {
            return (
              <div className="max-w-xl space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Years of Experience
                  </label>
                  <input
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(Number(e.target.value) || 0)}
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Specialization
                  </label>
                  <input
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
              </div>
            );
          }

          if (active === "preview" && agentProfile) {
            return (
              <div className="max-w-md rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm">
                <Eye className="mx-auto text-gold-500" size={28} />
                <p className="mt-3 text-sm text-gray-500">
                  This is how {fullName.split(" ")[0]}&rsquo;s profile appears to
                  the public on the agents directory.
                </p>
                <Button href={`/agents/${agentProfile.slug}`} variant="outline" className="mt-4">
                  View Public Profile
                </Button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                  <div className="relative h-40 w-full bg-navy-900" />
                  <div className="flex flex-wrap items-center justify-between gap-4 p-6">
                    <div className="-mt-16 flex items-center gap-4">
                      <div className="overflow-hidden rounded-full border-4 border-white">
                        <Avatar src={user.photo ?? undefined} name={fullName} size={80} />
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-navy-900">{fullName}</p>
                        <p className="text-sm text-gray-500">
                          {title || "—"} &bull; Magis Realty Global
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
                    </Button>
                  </div>
                  {error && <p className="px-6 pb-4 text-sm text-red-600">{error}</p>}
                </div>

                <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-navy-900">
                    <ShieldCheck size={18} className="text-gold-500" /> Identity{agentProfile ? " & Licenses" : ""}
                  </h2>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Full Name" value={fullName} onChange={setFullName} />
                    <Field label="Position / Title" value={title} onChange={setTitle} />
                    {agentProfile && (
                      <>
                        <Field label="PRC License No." value={prcLicense} onChange={setPrcLicense} />
                        <Field label="DHSUD Registration No." value={dhsudReg} onChange={setDhsudReg} />
                      </>
                    )}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                        Primary Office
                      </label>
                      <select
                        value={primaryOffice}
                        onChange={(e) => setPrimaryOffice(e.target.value)}
                        className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                      >
                        {officeOptions.map((office) => (
                          <option key={office}>{office}</option>
                        ))}
                      </select>
                    </div>
                    {agentProfile && (
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
                          <input
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addLanguage();
                              }
                            }}
                            placeholder="Add language"
                            className="w-28 rounded-full border border-dashed border-black/20 px-3 py-1.5 text-xs text-navy-900 focus:border-navy-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={addLanguage}
                            className="flex items-center gap-1 rounded-full border border-dashed border-black/20 px-3 py-1.5 text-xs text-gray-500 hover:border-navy-900 hover:text-navy-900"
                          >
                            <Plus size={12} /> Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {agentProfile && (
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
                  )}
                </div>
              </div>

              <div className="h-fit rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gold-600">
                  <Eye size={14} /> Live Preview
                  <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="overflow-hidden rounded-xl bg-navy-950 p-6 text-center text-white">
                  <div className="mx-auto overflow-hidden rounded-full border-2 border-white/40">
                    <Avatar src={user.photo ?? undefined} name={fullName} size={64} />
                  </div>
                  <p className="mt-3 font-serif text-lg font-bold">{fullName}</p>
                  <p className="text-[11px] uppercase tracking-wide text-gold-400">{title || "—"}</p>
                </div>
                <div className="space-y-3 p-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-navy-700" />
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Phone</p>
                      <p className="font-semibold text-navy-900">{user.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-navy-700" />
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Email</p>
                      <p className="font-semibold text-navy-900">{user.email}</p>
                    </div>
                  </div>
                  {agentProfile && (
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={16} className="text-navy-700" />
                      <div>
                        <p className="text-[10px] uppercase text-gray-400">License</p>
                        <p className="font-semibold text-navy-900">{prcLicense || "—"}</p>
                      </div>
                    </div>
                  )}
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
