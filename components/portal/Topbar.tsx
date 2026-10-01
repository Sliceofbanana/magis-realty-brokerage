"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { Bell, Check, Menu, Search, LogOut, Cake, UserPlus, Briefcase, UserCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/lib/actions/auth";
import { useBirthdays } from "./BirthdayContext";
import { searchPortalAction, type PortalSearchResult } from "@/lib/actions/search";
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

  async function markOneRead(e: MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
    await markNotificationReadAction(id);
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
            {notifications.length === 0 && birthdayNotifications.length === 0 ? (
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
                    </>
                  );
                  return (
                    <li key={n.id} className="group flex items-start hover:bg-offwhite">
                      {n.link ? (
                        <a
                          href={n.link}
                          onClick={() => handleNotificationClick(n)}
                          className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left"
                        >
                          {content}
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(n)}
                          className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left"
                        >
                          {content}
                        </button>
                      )}
                      {!n.read && (
                        <button
                          type="button"
                          title="Mark as read"
                          aria-label="Mark as read"
                          onClick={(e) => markOneRead(e, n.id)}
                          className="mr-3 mt-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gold-500 opacity-60 transition-opacity hover:bg-gold-100 hover:opacity-100 group-hover:opacity-100"
                        >
                          <Check size={12} />
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

const EMPTY_RESULTS: PortalSearchResult = { properties: [], leads: [] };

function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PortalSearchResult>(EMPTY_RESULTS);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchPortalAction(q).then((r) => {
        setResults(r);
        setLoading(false);
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function goTo(path: string, value: string) {
    setOpen(false);
    setQuery("");
    router.push(`${path}?q=${encodeURIComponent(value)}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) goTo("/portal/listings", query.trim());
  }

  const hasResults = results.properties.length > 0 || results.leads.length > 0;
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div className="relative hidden max-w-md flex-1 sm:block">
      <form onSubmit={handleSubmit}>
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search listings, leads..."
          className="w-full rounded-lg bg-offwhite py-2.5 pl-11 pr-4 text-sm text-navy-900 focus:outline-none"
        />
      </form>

      {showDropdown && (
        <>
          <button
            type="button"
            aria-label="Close search results"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-xl border border-black/5 bg-white shadow-lg">
            {loading ? (
              <p className="px-4 py-3 text-sm text-gray-400">Searching…</p>
            ) : !hasResults ? (
              <p className="px-4 py-3 text-sm text-gray-400">No matches for &ldquo;{query.trim()}&rdquo;</p>
            ) : (
              <div className="max-h-96 overflow-y-auto py-2">
                {results.properties.length > 0 && (
                  <div>
                    <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Listings
                    </p>
                    {results.properties.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => goTo("/portal/listings", p.title)}
                        className="flex w-full flex-col items-start px-4 py-2 text-left hover:bg-offwhite"
                      >
                        <span className="text-sm font-medium text-navy-900">{p.title}</span>
                        <span className="text-xs text-gray-400">{p.location}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results.leads.length > 0 && (
                  <div>
                    <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Leads
                    </p>
                    {results.leads.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => goTo("/portal/leads", l.name)}
                        className="flex w-full flex-col items-start px-4 py-2 text-left hover:bg-offwhite"
                      >
                        <span className="text-sm font-medium text-navy-900">{l.name}</span>
                        <span className="text-xs text-gray-400">{l.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

      <GlobalSearch />

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
