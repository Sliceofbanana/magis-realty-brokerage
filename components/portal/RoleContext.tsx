"use client";

import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";
import { PortalRole as PrismaPortalRole } from "@prisma/client";
import { PermissionKey, PortalRole } from "@/lib/types";
import { defaultRolePermissions } from "@/lib/data/permissions";

type RoleContextValue = {
  role: PortalRole;
  hasPermission: (key: PermissionKey) => boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

const sessionRoleToPortalRole: Record<PrismaPortalRole, PortalRole> = {
  ADMINISTRATOR: "Administrator",
  BROKER: "Broker",
  AGENT: "Agent",
  MARKETING: "Marketing",
};

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  // Always the signed-in user's real role — there is no client-side
  // override. Falls back to the least-privileged role while the session
  // is still resolving on first client render.
  const role: PortalRole = session?.user?.role
    ? sessionRoleToPortalRole[session.user.role]
    : "Agent";

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      hasPermission: (key) => defaultRolePermissions[role].includes(key),
    }),
    [role]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
}
