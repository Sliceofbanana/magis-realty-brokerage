import { PermissionDef, RolePermissionMatrix } from "@/lib/types";

export const permissionDefs: PermissionDef[] = [
  {
    key: "manage-users",
    label: "Manage Users",
    description: "Add, deactivate, and reset internal user accounts.",
  },
  {
    key: "manage-permissions",
    label: "Manage Permissions",
    description: "Edit this role-permission matrix. Always reserved for Administrators.",
    adminLocked: true,
  },
  {
    key: "view-activity-log",
    label: "View Activity Log",
    description: "Audit system activities, logins, and IP addresses.",
  },
  {
    key: "configure-commissions",
    label: "Configure Commission Rules",
    description: "Set brokerage splits, referral fees, and tiered incentives.",
  },
  {
    key: "configure-attendance",
    label: "Configure Attendance Rules",
    description: "Set attendance points, reward thresholds, and eligibility rates.",
  },
  {
    key: "configure-birthdays",
    label: "Configure Birthday Celebrations",
    description: "Enable announcements, edit messages, and choose which roles get notified.",
  },
  {
    key: "set-agent-quotas",
    label: "Set Agent Quotas",
    description: "Assign and adjust per-agent sales quotas on the leaderboard.",
  },
  {
    key: "export-reports",
    label: "Export Reports",
    description: "Download leaderboard, leads, and performance exports.",
  },
  {
    key: "manage-own-listings",
    label: "Manage Own Listings",
    description: "Create and edit property listings in the agent's own portfolio.",
  },
  {
    key: "manage-blogs",
    label: "Manage Blog Content",
    description: "Publish and edit brokerage insight articles.",
  },
];

export const defaultRolePermissions: RolePermissionMatrix = {
  Administrator: [
    "manage-users",
    "manage-permissions",
    "view-activity-log",
    "configure-commissions",
    "configure-attendance",
    "configure-birthdays",
    "set-agent-quotas",
    "export-reports",
    "manage-own-listings",
    "manage-blogs",
  ],
  Broker: [
    "view-activity-log",
    "set-agent-quotas",
    "export-reports",
    "manage-own-listings",
  ],
  Agent: ["export-reports", "manage-own-listings"],
  Marketing: ["manage-blogs", "export-reports"],
};
