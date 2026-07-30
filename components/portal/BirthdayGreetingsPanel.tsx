"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { X, Send, PartyPopper } from "lucide-react";
import { useBirthdays } from "./BirthdayContext";
import { ReactionEmoji } from "@/lib/types";

const REACTIONS: ReactionEmoji[] = ["🎉", "🎂", "❤️", "👏"];

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function BirthdayGreetingsPanel() {
  const { activePanelCelebrant, closeGreetingsPanel, greetingsFor, addGreeting, addReaction, config } =
    useBirthdays();
  const [message, setMessage] = useState("");

  if (!activePanelCelebrant) return null;

  const greetings = greetingsFor(activePanelCelebrant.id);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!activePanelCelebrant) return;
    addGreeting(activePanelCelebrant.id, message);
    setMessage("");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="greetings-panel-title"
      className="animate-birthday-fade fixed inset-0 z-100 flex items-end justify-center bg-navy-950/60 sm:items-center sm:p-4"
    >
      <div className="animate-birthday-scale flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-black/5 p-5">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full">
              <Image
                src={activePanelCelebrant.photo}
                alt={activePanelCelebrant.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 id="greetings-panel-title" className="font-serif text-lg font-bold text-navy-900">
                🎂 Greetings for {activePanelCelebrant.name.split(" ")[0]}
              </h2>
              <p className="text-xs text-gray-400">{greetings.length} birthday wishes so far</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeGreetingsPanel}
            aria-label="Close greetings panel"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-offwhite hover:text-navy-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {greetings.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              No greetings yet — be the first to say Happy Birthday!
            </p>
          )}
          {greetings.map((g) => (
            <div key={g.id} className="rounded-xl bg-offwhite p-4">
              <div className="flex items-start gap-3">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                  <Image src={g.authorPhoto} alt={g.authorName} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-navy-900">{g.authorName}</p>
                    <p className="text-[11px] text-gray-400">{timeAgo(g.timestamp)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-600">{g.message}</p>
                  <div className="mt-2 flex gap-1.5">
                    {REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addReaction(g.id, emoji)}
                        className="flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-0.5 text-xs hover:border-gold-400"
                      >
                        <span>{emoji}</span>
                        {!!g.reactions[emoji] && (
                          <span className="text-[11px] font-semibold text-navy-900">
                            {g.reactions[emoji]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {config.greetingsEnabled ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-black/5 p-4">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write a birthday message for ${activePanelCelebrant.name.split(" ")[0]}...`}
              className="w-full rounded-lg border border-black/10 bg-offwhite px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send greeting"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white hover:bg-navy-800"
            >
              <Send size={16} />
            </button>
          </form>
        ) : (
          <p className="flex items-center gap-2 border-t border-black/5 p-4 text-xs text-gray-400">
            <PartyPopper size={14} /> Team greetings are currently disabled by an administrator.
          </p>
        )}
      </div>
    </div>
  );
}
