"use client";

import { createContext, useContext, useMemo, useState } from "react";
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

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<PortalRole>("Administrator");
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
