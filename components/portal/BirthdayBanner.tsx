"use client";

import Image from "next/image";
import { PartyPopper, X, MessageCircleHeart } from "lucide-react";
import { useBirthdays } from "./BirthdayContext";

export function BirthdayBanner() {
  const { celebrants, bannerDismissed, dismissBanner, notificationsAllowed, openGreetingsPanel } =
    useBirthdays();

  if (!notificationsAllowed || bannerDismissed || celebrants.length === 0) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-navy-950 to-navy-800 p-6 text-white shadow-sm">
      <button
        type="button"
        onClick={dismissBanner}
        aria-label="Dismiss birthday announcement"
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
      >
        <X size={15} />
      </button>

      <div className="flex flex-wrap items-start gap-4 pr-8">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xl">
          🎂
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            {celebrants.length === 1 ? "Today's Birthday" : "Today's Birthdays"}
          </p>
          {celebrants.length === 1 ? (
            <p className="mt-1 font-serif text-lg font-bold">
              Join us in wishing {celebrants[0].name} a very Happy Birthday! 🎉
            </p>
          ) : (
            <>
              <p className="mt-1 font-serif text-lg font-bold">
                🎉 Today we&rsquo;re celebrating {celebrants.length} team birthdays:
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-white/80">
                {celebrants.map((c) => (
                  <li key={c.id}>&bull; {c.name}</li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-2 text-sm text-white/70">
            Don&rsquo;t forget to send your greetings and make their day extra special.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {celebrants.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => openGreetingsPanel(c)}
                className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-1.5 pr-3 text-sm font-medium hover:bg-white/20"
              >
                <span className="relative h-6 w-6 overflow-hidden rounded-full">
                  <Image src={c.photo} alt={c.name} fill className="object-cover" />
                </span>
                <MessageCircleHeart size={14} className="text-gold-400" />
                Greet {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <PartyPopper className="hidden shrink-0 text-gold-400 sm:block" size={28} />
      </div>
    </div>
  );
}
