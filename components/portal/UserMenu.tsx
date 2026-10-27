"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import { useFormStatus } from "react-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/lib/actions/auth";
import { useRole } from "./RoleContext";

const itemClass =
  "flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium focus:outline-none disabled:cursor-wait disabled:opacity-60";

function LogoutItem() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      role="menuitem"
      disabled={pending}
      className={`${itemClass} text-red-600 hover:bg-red-50 focus-visible:bg-red-50`}
    >
      <LogOut size={16} aria-hidden="true" />
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}

/**
 * The signed-in user in the portal header. One button (avatar, name, role) opens
 * an account menu: who you are, Profile, and Log out. Follows the WAI-ARIA menu
 * button pattern: arrow keys move, Escape closes and returns focus, Tab leaves.
 */
export function UserMenu() {
  const { data: session } = useSession();
  const { role } = useRole();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const name = session?.user?.name ?? undefined;
  const email = session?.user?.email ?? undefined;

  function items() {
    return Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? []);
  }

  // Move focus into the menu when it opens, so it works from the keyboard straight away.
  useEffect(() => {
    if (open) items()[0]?.focus();
  }, [open]);

  // Click or tap anywhere outside closes it, without swallowing that click.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onTriggerKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(e: KeyboardEvent) {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        list[(index + 1) % list.length]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        list[(index - 1 + list.length) % list.length]?.focus();
        break;
      case "Home":
        e.preventDefault();
        list[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        list[list.length - 1]?.focus();
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        // Hand focus back to the trigger so Tab carries on to the next control in the header.
        setOpen(false);
        triggerRef.current?.focus();
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={name ? `${name} — account menu` : "Account menu"}
        className={`flex h-11 cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-offwhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 sm:pr-3 ${
          open ? "bg-offwhite" : ""
        }`}
      >
        <Avatar src={session?.user?.photo ?? undefined} name={name} size={36} />
        <span className="hidden text-left sm:block">
          <span className="block max-w-40 truncate text-sm font-semibold leading-tight text-navy-900">
            {name ?? "…"}
          </span>
          <span className="block text-[11px] leading-tight text-gray-500">{role}</span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`text-gray-400 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-black/5 bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3">
            <Avatar src={session?.user?.photo ?? undefined} name={name} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy-900">{name ?? "Signed in"}</p>
              {email && (
                <p className="truncate text-xs text-gray-500" title={email}>
                  {email}
                </p>
              )}
              <p className="mt-1 flex flex-wrap gap-1">
                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold text-gold-600">
                  {role}
                </span>
                {session?.user?.isSystemAdmin && (
                  <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    System Admin
                  </span>
                )}
              </p>
            </div>
          </div>

          <div ref={menuRef} id={menuId} role="menu" aria-label="Account" onKeyDown={onMenuKeyDown}>
            <Link
              href="/portal/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`${itemClass} text-navy-900 hover:bg-offwhite focus-visible:bg-offwhite`}
            >
              <UserRound size={16} aria-hidden="true" />
              My profile
            </Link>

            {/* Set apart from the everyday items so it isn't hit by accident. */}
            <form action={logoutAction} className="border-t border-black/5">
              <LogoutItem />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
