import {
  LayoutGrid,
  User,
  Building2,
  Users,
  Trophy,
  Rss,
  Wallet,
  FileText,
  Settings,
} from "lucide-react";

export const portalNavItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutGrid },
  { href: "/portal/profile", label: "Profile", icon: User },
  { href: "/portal/listings", label: "Listings", icon: Building2 },
  { href: "/portal/leads", label: "Leads", icon: Users },
  { href: "/portal/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/portal/blogs", label: "Blogs", icon: Rss },
  { href: "/portal/commissions", label: "Commissions", icon: Wallet },
  { href: "/portal/documents", label: "Documents", icon: FileText },
  { href: "/portal/settings", label: "Settings", icon: Settings },
];
