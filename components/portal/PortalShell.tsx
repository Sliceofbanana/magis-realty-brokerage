"use client";

import { useState } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { RoleProvider } from "./RoleContext";
import { BirthdayProvider } from "./BirthdayContext";
import { BirthdayModal } from "./BirthdayModal";
import { BirthdayGreetingsPanel } from "./BirthdayGreetingsPanel";

export function PortalShell({
  children,
  maintenanceNotice,
}: {
  children: React.ReactNode;
  /** Set only for System Admins while any maintenance switch is on. */
  maintenanceNotice?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RoleProvider>
      <BirthdayProvider>
        <div className="flex min-h-screen bg-offwhite">
          <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar onMenuClick={() => setMobileOpen(true)} />
            {maintenanceNotice && (
              <Link
                href="/portal/system"
                className="flex items-start gap-2 bg-amber-100 px-4 py-2.5 text-xs font-medium text-amber-900 hover:bg-amber-200 sm:px-6 lg:px-8"
              >
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                <span>{maintenanceNotice} You can still see everything because you are a System Admin.</span>
              </Link>
            )}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
        <BirthdayModal />
        <BirthdayGreetingsPanel />
      </BirthdayProvider>
    </RoleProvider>
  );
}
