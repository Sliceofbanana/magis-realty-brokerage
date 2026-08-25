"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Bell, Menu, Search, LogOut, Cake, UserPlus, Briefcase, UserCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/lib/actions/auth";
import { useBirthdays } from "./BirthdayContext";
import {
  listMyNotifications,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  type NotificationRow,
} from "@/lib/actions/notifications";

const notificationIcon: Record<NotificationRow["type"], typeof UserPlus> = {
  NEW_LEAD: UserPlus,
  NEW_APPLICATION: Briefcase,
  NEW_REGISTRATION: UserCheck,
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const { celebrants, notificationsAllowed, openGreetingsPanel } = useBirthdays();
  const birthdayNotifications = notificationsAllowed ? celebrants : [];

  useEffect(() => {
    listMyNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const count = unreadCount + birthdayNotifications.length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) listMyNotifications().then(setNotifications);
  }

  async function handleNotificationClick(n: NotificationRow) {
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      await markNotificationReadAction(n.id);
    }
    setOpen(false);
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsReadAction();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
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
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
              <p className="text-sm font-semibold text-navy-900">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-semibold text-gold-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            {count === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">You&rsquo;re all caught up.</p>
            ) : (
              <ul className="max-h-96 overflow-y-auto">
                {birthdayNotifications.map((c) => (
                  <li key={`birthday-${c.id}`}>
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
                {notifications.map((n) => {
                  const Icon = notificationIcon[n.type];
                  const content = (
                    <>
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          n.read ? "bg-gray-100 text-gray-400" : "bg-navy-900 text-gold-400"
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm ${n.read ? "font-medium text-gray-500" : "font-semibold text-navy-900"}`}>
                          {n.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-gray-500">{n.body}</span>
                        <span className="mt-0.5 block text-[11px] text-gray-400">{timeAgo(n.createdAt)}</span>
                      </span>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" />}
                    </>
                  );
                  return (
                    <li key={n.id}>
                      {n.link ? (
                        <a
                          href={n.link}
                          onClick={() => handleNotificationClick(n)}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-offwhite"
                        >
                          {content}
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(n)}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-offwhite"
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b border-black/5 bg-white px-4 sm:px-6">
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
        <NotificationsMenu />

        <div className="flex items-center gap-2">
          <Avatar
            src={session?.user?.photo ?? undefined}
            name={session?.user?.name ?? undefined}
            size={36}
          />
          <span className="hidden text-sm font-semibold text-navy-900 sm:block">
            {session?.user?.name ?? "…"}
          </span>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-navy-900"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
