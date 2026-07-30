"use client";

import { useEffect, useState } from "react";
import { X, Cake, Gift, PartyPopper } from "lucide-react";
import { useBirthdays } from "./BirthdayContext";
import { buildBirthdayMessage } from "@/lib/birthdays";

const CONFETTI_COLORS = ["#b8935a", "#cba86e", "#1c3a66", "#e0c99a", "#ffffff"];

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rounded: boolean;
};

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 2.5 + Math.random() * 2,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 6,
    rounded: Math.random() > 0.5,
  }));
}

function Confetti() {
  // Starts empty so server and first client render match exactly (no
  // hydration mismatch from Math.random), then fills in on the client only
  // — confetti popping in a frame after the modal opens is imperceptible.
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    // One-time client-only randomization that cannot be derived during
    // render without a server/client mismatch — see Confetti's comment above.
    setPieces(generateConfetti()); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="animate-birthday-confetti absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.rounded ? "9999px" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function BirthdayModal() {
  const { modalOpen, dismissModal, currentUser, config } = useBirthdays();

  if (!modalOpen) return null;

  const message = buildBirthdayMessage(config.messageTemplate, currentUser.name.split(" ")[0]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="birthday-modal-title"
      className="animate-birthday-fade fixed inset-0 z-100 flex items-center justify-center bg-navy-950/70 p-4"
    >
      <div className="animate-birthday-scale relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-navy-950 px-6 pb-10 pt-8 text-center text-white">
          {config.confettiEnabled && <Confetti />}
          <button
            type="button"
            onClick={dismissModal}
            aria-label="Close birthday celebration"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          >
            <X size={16} />
          </button>
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-white shadow-lg">
            <Cake size={30} />
          </div>
          <p className="relative mt-4 text-xs font-semibold uppercase tracking-widest text-gold-400">
            Magis Realty &amp; Brokerage
          </p>
          <h2 id="birthday-modal-title" className="relative mt-2 font-serif text-2xl font-bold">
            🎉 Happy Birthday, {currentUser.name.split(" ")[0]}!
          </h2>
        </div>

        <div className="px-6 py-6 text-center">
          <p className="text-sm leading-relaxed text-gray-600">{message}</p>

          {config.rewardsEnabled && (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-gold-100 p-4 text-left">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500 text-white">
                <Gift size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy-900">Your Birthday Reward</p>
                <p className="mt-0.5 text-xs text-gray-600">{config.rewardMessage}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={dismissModal}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-navy-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-navy-800"
          >
            <PartyPopper size={16} /> Thank You!
          </button>
        </div>
      </div>
    </div>
  );
}
