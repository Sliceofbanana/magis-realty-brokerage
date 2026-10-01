"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { PortalRole as PrismaPortalRole } from "@prisma/client";
import { PermissionKey, PortalRole } from "@/lib/types";
import { defaultRolePermissions } from "@/lib/data/permissions";
import { getMyPermissionsAction } from "@/lib/actions/permissions";

type RoleContextValue = {
  role: PortalRole;
  hasPermission: (key: PermissionKey) => boolean;
  refreshPermissions: () => void;
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

  // Effective permissions (role default merged with this user's own
  // per-user override), fetched from Postgres — not just the static role
  // matrix, so overrides set via the Permissions admin page actually take
  // effect. `null` while loading; `hasPermission` falls back to the static
  // role default during that window so gating doesn't flicker shut on load.
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean> | null>(null);

  function loadPermissions() {
    getMyPermissionsAction().then(setPermissions);
  }

  useEffect(() => {
    if (session?.user) loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      hasPermission: (key) => permissions?.[key] ?? defaultRolePermissions[role].includes(key),
      refreshPermissions: loadPermissions,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, permissions]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
}
