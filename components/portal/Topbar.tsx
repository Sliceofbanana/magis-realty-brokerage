"use client";

import Link from "next/link";
import { Bell, Grid3x3, Menu, Search, LogOut, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { portraits } from "@/lib/stockPhotos";
import { PortalRole } from "@/lib/types";
import { useRole } from "./RoleContext";

const roles: PortalRole[] = ["Administrator", "Broker", "Agent", "Marketing"];

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { role, setRole } = useRole();
  return (
    <header className="flex h-20 items-center gap-4 border-b border-black/5 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="text-navy-900 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search listings, leads..."
          className="w-full rounded-lg bg-offwhite py-2.5 pl-11 pr-4 text-sm text-navy-900 focus:outline-none"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <label className="hidden items-center gap-2 rounded-lg bg-offwhite px-3 py-2 text-xs font-medium text-gray-500 md:flex">
          <ShieldCheck size={14} className="text-gold-600" />
          Viewing as
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as PortalRole)}
            className="bg-transparent text-xs font-semibold text-navy-900 focus:outline-none"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-offwhite hover:text-navy-900"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          aria-label="Apps"
          className="hidden h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-offwhite hover:text-navy-900 sm:flex"
        >
          <Grid3x3 size={18} />
        </button>

        <div className="flex items-center gap-2">
          <Avatar src={portraits.manCasualBeardedGlasses} name="Agent Smith" size={36} />
          <span className="hidden text-sm font-semibold text-navy-900 sm:block">Agent Smith</span>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-navy-900"
          title="Log out"
        >
          <LogOut size={16} />
        </Link>
      </div>
    </header>
  );
}
