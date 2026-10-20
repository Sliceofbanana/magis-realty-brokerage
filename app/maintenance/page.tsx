import Image from "next/image";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { getSystemSettings } from "@/lib/system-settings";
import { defaultMaintenanceMessages } from "@/lib/maintenance";

export const metadata = {
  title: "Under Maintenance | Magis Realty & Brokerage",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Shown (with a 503 status) in place of the site when a System Admin turns on
 * public or portal maintenance. Deliberately standalone — no header/footer —
 * so nothing here depends on the parts of the site that are offline.
 */
export default async function MaintenancePage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const { scope } = await searchParams;
  const settings = await getSystemSettings();
  const isPortal = scope === "portal";
  const message =
    (isPortal ? settings.portalMessage : settings.publicMessage) ||
    (isPortal ? defaultMaintenanceMessages.portal : defaultMaintenanceMessages.public);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy-950 px-4 py-10 text-white">
      <div className="w-full max-w-md text-center">
        <Image
          src="/images/footer-logo.png"
          alt="Magis Realty & Brokerage"
          width={1200}
          height={542}
          priority
          className="mx-auto h-20 w-auto object-contain"
        />
        <span className="mx-auto mt-10 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
          <Wrench size={26} />
        </span>
        <h1 className="mt-6 font-serif text-3xl font-bold sm:text-4xl">
          {isPortal ? "Portal under maintenance" : "We'll be right back"}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/70">{message}</p>
        <Link
          href="/login"
          className="mt-10 inline-block text-xs font-semibold uppercase tracking-wide text-white/40 hover:text-gold-400"
        >
          Staff sign in
        </Link>
      </div>
    </main>
  );
}
