"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { portalNavItems, portalAdminNavItems, portalFooterNavItems } from "./navItems";
import { useRole } from "./RoleContext";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number }> };

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { role } = useRole();

  function NavLink({ item }: { item: NavItem }) {
    const active =
      item.href === "/portal" ? pathname === "/portal" : pathname.startsWith(item.href);
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          active ? "bg-gold-500 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        <item.icon size={18} />
        {item.label}
      </Link>
    );
  }

  const content = (
    <>
      <div className="flex items-center justify-between px-6 py-6">
        <Link href="/portal">
          <Image
            src="/images/footer-logo.png"
            alt="Magis Realty & Brokerage"
            width={1200}
            height={542}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="text-white/70 hover:text-white lg:hidden"
        >
          <X size={22} />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-6" aria-label="Portal navigation">
        {portalNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {role === "Administrator" && (
          <>
            <p className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">
              Administration
            </p>
            {portalAdminNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </>
        )}
      </nav>
      <div className="shrink-0 border-t border-white/10 px-3 py-3">
        {portalFooterNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col bg-navy-950 lg:sticky lg:top-0 lg:flex lg:h-screen">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-navy-950/60"
            onClick={onClose}
          />
          <aside className="relative flex h-full w-72 flex-col bg-navy-950">{content}</aside>
        </div>
      )}
    </>
  );
}
