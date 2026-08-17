"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { PortalRole as PrismaPortalRole } from "@prisma/client";
import { PermissionKey, PortalRole, RolePermissionMatrix } from "@/lib/types";
import { defaultRolePermissions } from "@/lib/data/permissions";

type RoleContextValue = {
  role: PortalRole;
  setRole: (role: PortalRole) => void;
  matrix: RolePermissionMatrix;
  hasPermission: (key: PermissionKey) => boolean;
  togglePermission: (role: PortalRole, key: PermissionKey) => void;
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
  const sessionRole = session?.user?.role
    ? sessionRoleToPortalRole[session.user.role]
    : undefined;

  // Defaults to the signed-in user's real role; falls back to Administrator
  // only while the session is still resolving on first client render.
  const [role, setRole] = useState<PortalRole>(sessionRole ?? "Administrator");

  // Re-sync `role` when the session's role changes (e.g. resolves after
  // first render). Setting state during render — rather than in an effect —
  // is the React-recommended way to adjust state from a changed prop; it
  // re-renders before commit instead of scheduling an extra effect pass.
  const [syncedSessionRole, setSyncedSessionRole] = useState(sessionRole);
  if (sessionRole !== syncedSessionRole) {
    setSyncedSessionRole(sessionRole);
    if (sessionRole) setRole(sessionRole);
  }

  const [matrix, setMatrix] = useState<RolePermissionMatrix>(defaultRolePermissions);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      setRole,
      matrix,
      hasPermission: (key) => matrix[role].includes(key),
      togglePermission: (targetRole, key) =>
        setMatrix((prev) => {
          const current = prev[targetRole];
          return {
            ...prev,
            [targetRole]: current.includes(key)
              ? current.filter((k) => k !== key)
              : [...current, key],
          };
        }),
    }),
    [role, matrix]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
}
