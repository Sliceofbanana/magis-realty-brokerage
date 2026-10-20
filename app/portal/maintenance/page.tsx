import Link from "next/link";
import { Wrench } from "lucide-react";
import { getSystemSettings } from "@/lib/system-settings";
import { defaultMaintenanceMessages, maintenanceFeatures } from "@/lib/maintenance";

export const metadata = { title: "Under Maintenance | Magis Realty & Brokerage" };
export const dynamic = "force-dynamic";

/** Shown inside the portal (sidebar and all) when one feature is switched off by a System Admin. */
export default async function FeatureMaintenancePage({ searchParams }: { searchParams: Promise<{ feature?: string }> }) {
  const { feature } = await searchParams;
  const settings = await getSystemSettings();
  const label = maintenanceFeatures.find((f) => f.key === feature)?.label ?? "This section";
  const message = settings.featureMessage || defaultMaintenanceMessages.feature;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 text-gold-600">
        <Wrench size={26} />
      </span>
      <h1 className="mt-6 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">{label} is under maintenance</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-500">{message}</p>
      <Link
        href="/portal"
        className="mt-8 rounded-md bg-navy-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy-800"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
