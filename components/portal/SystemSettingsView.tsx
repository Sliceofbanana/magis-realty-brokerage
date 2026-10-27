"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, LayoutGrid, ShieldCheck, UserPlus, Inbox, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { saveSystemSettingsAction, setSystemAdminAction, type SystemOverview } from "@/lib/actions/system";
import {
  MESSAGE_MAX_LENGTH,
  anyMaintenanceActive,
  defaultMaintenanceMessages,
  maintenanceFeatures,
  type SystemSettingsValue,
} from "@/lib/maintenance";

function StatusPill({ on, onLabel, offLabel, danger = false }: { on: boolean; onLabel: string; offLabel: string; danger?: boolean }) {
  const active = on;
  const tone = active ? (danger ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700") : danger ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {active ? onLabel : offLabel}
    </span>
  );
}

function Card({ icon, title, description, children }: { icon: React.ReactNode; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-navy-700">{icon}</span>
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-bold text-navy-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SwitchRow({ title, hint, checked, onChange, tone = "default" }: { title: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; tone?: "default" | "danger" }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-offwhite px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy-900">{title}</p>
        {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
      </div>
      <div className={tone === "danger" && checked ? "[&_button]:bg-amber-500!" : ""}>
        <Toggle checked={checked} onChange={onChange} label={title} />
      </div>
    </div>
  );
}

function MessageField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="mt-3">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
        rows={2}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
      />
      <p className="mt-1 text-right text-[11px] text-gray-400">
        {value.length}/{MESSAGE_MAX_LENGTH}
      </p>
    </div>
  );
}

export function SystemSettingsView({ overview }: { overview: SystemOverview }) {
  const router = useRouter();
  const [saved, setSaved] = useState<SystemSettingsValue>(overview.settings);
  const [s, setS] = useState<SystemSettingsValue>(overview.settings);
  const [saving, setSaving] = useState(false);
  const { confirm, confirmDialog } = useConfirm();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [adminBusy, setAdminBusy] = useState<string | null>(null);
  const [adminError, setAdminError] = useState("");

  const dirty = useMemo(() => JSON.stringify(s) !== JSON.stringify(saved), [s, saved]);
  const set = <K extends keyof SystemSettingsValue>(key: K, value: SystemSettingsValue[K]) => setS((prev) => ({ ...prev, [key]: value }));

  function toggleFeature(key: string, on: boolean) {
    set("maintenanceFeatures", on ? [...s.maintenanceFeatures, key] : s.maintenanceFeatures.filter((k) => k !== key));
  }

  async function save() {
    // Taking a whole area offline is the one thing worth a second thought.
    const turningOn: string[] = [];
    if (s.publicMaintenance && !saved.publicMaintenance) turningOn.push("the whole public website");
    if (s.portalMaintenance && !saved.portalMaintenance) turningOn.push("the entire portal");
    if (turningOn.length) {
      const ok = await confirm({
        title: "Take it offline?",
        description: `This will take ${turningOn.join(" and ")} offline for everyone except System Admins.`,
        confirmLabel: "Take offline",
      });
      if (!ok) return;
    }

    setSaving(true);
    setMessage(null);
    const result = await saveSystemSettingsAction(s);
    setSaving(false);
    if (result.error) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    setSaved(s);
    setMessage({ ok: true, text: "Saved. Changes take effect within a few seconds." });
    router.refresh();
  }

  async function changeSystemAdmin(userId: string, make: boolean) {
    setAdminBusy(userId);
    setAdminError("");
    const result = await setSystemAdminAction(userId, make);
    setAdminBusy(null);
    if (result.error) {
      setAdminError(result.error);
      return;
    }
    router.refresh();
  }

  const featuresOffline = s.maintenanceFeatures.length;

  return (
    <div>
      <PageHeader
        title="System"
        description="Platform controls for System Admins: maintenance mode, sign-ups, public forms and who else has this access."
      />

      {/* Live status */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Public website", pill: <StatusPill on={saved.publicMaintenance} onLabel="Under maintenance" offLabel="Online" danger /> },
          { label: "Portal", pill: <StatusPill on={saved.portalMaintenance} onLabel="Under maintenance" offLabel="Online" danger /> },
          {
            label: "Portal features",
            pill: <StatusPill on={saved.maintenanceFeatures.length > 0} onLabel={`${saved.maintenanceFeatures.length} offline`} offLabel="All online" danger />,
          },
          {
            label: "Sign-ups / public forms",
            pill: (
              <span className="flex flex-wrap gap-1.5">
                <StatusPill on={saved.registrationOpen} onLabel="Sign-ups open" offLabel="Sign-ups closed" />
                <StatusPill on={saved.inquiriesOpen} onLabel="Forms open" offLabel="Forms closed" />
              </span>
            ),
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.label}</p>
            <div className="mt-2">{item.pill}</div>
          </div>
        ))}
      </div>

      {anyMaintenanceActive(saved) && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          <p>Maintenance mode is ON. Everyone except System Admins sees the maintenance screen. You are seeing the normal site only because you are a System Admin.</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card icon={<Globe size={18} />} title="Public website" description="The marketing site visitors see: home, properties, agents, blog, contact. Sign-in and Request Access pages stay reachable.">
          <SwitchRow title="Put the whole public website under maintenance" hint="Visitors see the maintenance screen." checked={s.publicMaintenance} onChange={(v) => set("publicMaintenance", v)} tone="danger" />
          <MessageField label="Message to visitors" value={s.publicMessage} onChange={(v) => set("publicMessage", v)} placeholder={defaultMaintenanceMessages.public} />
        </Card>

        <Card icon={<LayoutGrid size={18} />} title="Entire portal" description="Takes every portal page offline for agents, brokers, marketing and regular Administrators.">
          <SwitchRow title="Put the whole portal under maintenance" hint="Only System Admins can still sign in and use the portal." checked={s.portalMaintenance} onChange={(v) => set("portalMaintenance", v)} tone="danger" />
          <MessageField label="Message to portal users" value={s.portalMessage} onChange={(v) => set("portalMessage", v)} placeholder={defaultMaintenanceMessages.portal} />
        </Card>

        <div className="xl:col-span-2">
          <Card
            icon={<LayoutGrid size={18} />}
            title="Individual portal features"
            description={`Switch off just the parts you're working on — everything else keeps running. ${featuresOffline ? `${featuresOffline} offline.` : ""}`}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {maintenanceFeatures.map((f) => (
                <SwitchRow
                  key={f.key}
                  title={f.label}
                  hint={s.maintenanceFeatures.includes(f.key) ? "Under maintenance" : "Online"}
                  checked={s.maintenanceFeatures.includes(f.key)}
                  onChange={(v) => toggleFeature(f.key, v)}
                  tone="danger"
                />
              ))}
            </div>
            <MessageField label="Message shown on those features" value={s.featureMessage} onChange={(v) => set("featureMessage", v)} placeholder={defaultMaintenanceMessages.feature} />
          </Card>
        </div>

        <Card icon={<UserPlus size={18} />} title="Sign-ups" description="Controls whether new agents can register. Turn this off when you're being hit by bot sign-ups.">
          <SwitchRow title="Accept new registrations" hint={s.registrationOpen ? "Open — anyone can apply." : "Closed — the registration form shows an error."} checked={s.registrationOpen} onChange={(v) => set("registrationOpen", v)} />
        </Card>

        <Card icon={<Inbox size={18} />} title="Public forms" description="Contact, property and agent inquiries, job applications and the newsletter form.">
          <SwitchRow title="Accept public form submissions" hint={s.inquiriesOpen ? "Open — submissions become leads." : "Closed — visitors are asked to call the office instead."} checked={s.inquiriesOpen} onChange={(v) => set("inquiriesOpen", v)} />
        </Card>

        <div className="xl:col-span-2">
          <Card icon={<ShieldCheck size={18} />} title="System Admins" description="Administrators who can use this page and are never blocked by maintenance mode. There must always be at least one.">
            {adminError && <p className="mb-3 text-sm text-red-600">{adminError}</p>}
            <ul className="divide-y divide-black/5 rounded-xl border border-black/5">
              {overview.administrators.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={a.name} size={36} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-900">
                        {a.name} {a.id === overview.currentUserId && <span className="text-xs font-normal text-gray-400">(you)</span>}
                      </p>
                      <p className="truncate text-xs text-gray-400">{a.email}</p>
                    </div>
                  </div>
                  <Toggle checked={a.isSystemAdmin} disabled={adminBusy === a.id} onChange={(v) => changeSystemAdmin(a.id, v)} label={`System Admin: ${a.name}`} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-400">A newly tagged System Admin sees the System page after they sign out and back in.</p>
          </Card>
        </div>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-black/10 bg-offwhite/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-sm ${message ? (message.ok ? "text-emerald-700" : "text-red-600") : "text-gray-500"}`}>
            {message ? message.text : dirty ? "You have unsaved changes." : "No changes."}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!dirty || saving} onClick={() => { setS(saved); setMessage(null); }}>
              Discard
            </Button>
            <Button size="sm" disabled={!dirty || saving} onClick={save}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
      {confirmDialog}
    </div>
  );
}
