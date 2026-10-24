import {
  LayoutGrid,
  User,
  Building2,
  Users,
  Trophy,
  CalendarCheck2,
  Rss,
  Wallet,
  FileText,
  Briefcase,
  KeyRound,
  Settings,
  ServerCog,
} from "lucide-react";
import type { PermissionKey } from "@/lib/types";

export const portalNavItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutGrid },
  { href: "/portal/listings", label: "Listings", icon: Building2 },
  { href: "/portal/leads", label: "Leads", icon: Users },
  { href: "/portal/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/portal/attendance", label: "Attendance", icon: CalendarCheck2 },
  { href: "/portal/blogs", label: "Blogs", icon: Rss },
  { href: "/portal/commissions", label: "Commissions", icon: Wallet },
  { href: "/portal/documents", label: "Documents", icon: FileText },
];

/** Administration pages. Items with a `permission` follow that permission (so a per-user grant
 *  surfaces them); the rest are Administrator-only. Each page's data is guarded server-side
 *  either way, so hiding a link is tidiness, not the protection. */
export const portalAdminNavItems: { href: string; label: string; icon: typeof Users; permission?: PermissionKey }[] = [
  { href: "/portal/teams", label: "Teams", icon: Users },
  { href: "/portal/careers", label: "Careers", icon: Briefcase },
  { href: "/portal/users", label: "Users", icon: User, permission: "manage-users" },
  { href: "/portal/permissions", label: "Permissions", icon: KeyRound, permission: "manage-permissions" },
];

/** System Admin only — see app/portal/system. */
export const portalSystemNavItems = [{ href: "/portal/system", label: "System", icon: ServerCog }];

export const portalFooterNavItems = [
  { href: "/portal/settings", label: "Settings", icon: Settings },
];
