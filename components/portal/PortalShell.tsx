"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { RoleProvider } from "./RoleContext";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RoleProvider>
      <div className="flex min-h-screen bg-offwhite">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </RoleProvider>
  );
}
