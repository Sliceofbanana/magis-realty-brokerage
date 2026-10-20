import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { PortalShell } from "@/components/portal/PortalShell";
import { getSystemSettings } from "@/lib/system-settings";
import { anyMaintenanceActive, maintenanceFeatures } from "@/lib/maintenance";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Only System Admins ever get past maintenance mode — remind them it's on.
  let maintenanceNotice: string | undefined;
  if (session?.user?.isSystemAdmin) {
    const s = await getSystemSettings();
    if (anyMaintenanceActive(s)) {
      const parts: string[] = [];
      if (s.publicMaintenance) parts.push("the public website");
      if (s.portalMaintenance) parts.push("the entire portal");
      const offline = maintenanceFeatures.filter((f) => s.maintenanceFeatures.includes(f.key)).map((f) => f.label);
      if (offline.length) parts.push(`${offline.join(", ")}`);
      maintenanceNotice = `Maintenance mode is ON for: ${parts.join("; ")}.`;
    }
  }

  return (
    <AuthSessionProvider session={session}>
      <PortalShell maintenanceNotice={maintenanceNotice}>{children}</PortalShell>
    </AuthSessionProvider>
  );
}
