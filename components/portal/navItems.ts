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
  Settings,
} from "lucide-react";

export const portalNavItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutGrid },
  { href: "/portal/listings", label: "Listings", icon: Building2 },
  { href: "/portal/leads", label: "Leads", icon: Users },
  { href: "/portal/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/portal/teams", label: "Teams", icon: Users },
  { href: "/portal/attendance", label: "Attendance", icon: CalendarCheck2 },
  { href: "/portal/blogs", label: "Blogs", icon: Rss },
  { href: "/portal/commissions", label: "Commissions", icon: Wallet },
  { href: "/portal/documents", label: "Documents", icon: FileText },
  { href: "/portal/careers", label: "Careers", icon: Briefcase },
  { href: "/portal/users", label: "Users", icon: User },
];

export const portalFooterNavItems = [
  { href: "/portal/settings", label: "Settings", icon: Settings },
];
