import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { PortalShell } from "@/components/portal/PortalShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <AuthSessionProvider session={session}>
      <PortalShell>{children}</PortalShell>
    </AuthSessionProvider>
  );
}
