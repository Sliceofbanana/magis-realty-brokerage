"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Grid3x3, Menu, Search, LogOut, ShieldCheck, Cake } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { portraits } from "@/lib/stockPhotos";
import { PortalRole } from "@/lib/types";
import { useRole } from "./RoleContext";
import { useBirthdays } from "./BirthdayContext";

const roles: PortalRole[] = ["Administrator", "Broker", "Agent", "Marketing"];

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const { celebrants, notificationsAllowed, openGreetingsPanel } = useBirthdays();
  const birthdayNotifications = notificationsAllowed ? celebrants : [];
  const count = birthdayNotifications.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-offwhite hover:text-navy-900"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-black/5 bg-white shadow-lg">
            <div className="border-b border-black/5 px-4 py-3">
              <p className="text-sm font-semibold text-navy-900">Notifications</p>
            </div>
            {count === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">You&rsquo;re all caught up.</p>
            ) : (
              <ul>
                {birthdayNotifications.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        openGreetingsPanel(c);
                        setOpen(false);
                      }}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-offwhite"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                        <Cake size={16} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-navy-900">
                          🎂 Birthday Celebration
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          Today is {c.name}&rsquo;s Birthday! Be sure to send your warm wishes.
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

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
        <NotificationsMenu />
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
