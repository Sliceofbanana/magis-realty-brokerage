"use client";

import Image from "next/image";
import { Cake, MessageCircleHeart } from "lucide-react";
import { useBirthdays } from "./BirthdayContext";
import { ageOn } from "@/lib/birthdays";

export function TodaysBirthdaysWidget() {
  const { celebrants, notificationsAllowed, openGreetingsPanel } = useBirthdays();

  if (!notificationsAllowed) return null;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-navy-900">
        <Cake size={18} className="text-gold-500" /> Today&rsquo;s Birthdays
      </h2>

      {celebrants.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">No birthdays today.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {celebrants.map((c) => (
            <li key={c.id} className="flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-gold-400">
                <Image src={c.photo} alt={c.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy-900">{c.name}</p>
                <p className="truncate text-xs text-gray-400">
                  {c.position} &bull; Turns {ageOn(c.birthDate)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-gold-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-600">
                🎂 Birthday
              </span>
            </li>
          ))}
        </ul>
      )}

      {celebrants.length > 0 && (
        <button
          type="button"
          onClick={() => openGreetingsPanel(celebrants[0])}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-offwhite px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gray-100"
        >
          <MessageCircleHeart size={16} className="text-gold-500" /> Send a Greeting
        </button>
      )}
    </div>
  );
}
