"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { BirthdayConfig, BirthdayGreeting, ReactionEmoji, TeamMember } from "@/lib/types";
import { team as defaultTeam, defaultBirthdayConfig } from "@/lib/data/team";
import { celebrantsToday, todayKey } from "@/lib/birthdays";
import { useRole } from "./RoleContext";

const MODAL_KEY_PREFIX = "magis-bday-modal-dismissed-";
const BANNER_KEY_PREFIX = "magis-bday-banner-dismissed-";
const GREETINGS_KEY = "magis-bday-greetings";

// Local-storage-backed boolean, hydration-safe via useSyncExternalStore:
// the server snapshot is always `false`, and the client re-syncs to the
// real persisted value right after mount without a manual effect/setState.
function subscribeNoop() {
  return () => {};
}

function useStoredFlag(key: string) {
  return useSyncExternalStore(
    subscribeNoop,
    () => localStorage.getItem(key) === "1",
    () => false
  );
}

function useStoredGreetings(): [BirthdayGreeting[], (next: BirthdayGreeting[]) => void] {
  const stored = useSyncExternalStore(
    subscribeNoop,
    () => localStorage.getItem(GREETINGS_KEY),
    () => null
  );
  const [override, setOverride] = useState<BirthdayGreeting[] | null>(null);

  const parsed = useMemo<BirthdayGreeting[]>(() => {
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }, [stored]);

  function persist(next: BirthdayGreeting[]) {
    localStorage.setItem(GREETINGS_KEY, JSON.stringify(next));
    setOverride(next);
  }

  return [override ?? parsed, persist];
}

type BirthdayContextValue = {
  config: BirthdayConfig;
  updateConfig: (patch: Partial<BirthdayConfig>) => void;
  team: TeamMember[];
  currentUser: TeamMember;
  celebrants: TeamMember[];
  youAreCelebrant: boolean;
  notificationsAllowed: boolean;
  modalOpen: boolean;
  dismissModal: () => void;
  bannerDismissed: boolean;
  dismissBanner: () => void;
  greetings: BirthdayGreeting[];
  greetingsFor: (celebrantId: string) => BirthdayGreeting[];
  addGreeting: (celebrantId: string, message: string) => void;
  addReaction: (greetingId: string, emoji: ReactionEmoji) => void;
  activePanelCelebrant: TeamMember | null;
  openGreetingsPanel: (celebrant: TeamMember) => void;
  closeGreetingsPanel: () => void;
};

const BirthdayContext = createContext<BirthdayContextValue | null>(null);

export function BirthdayProvider({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  const [config, setConfig] = useState<BirthdayConfig>(defaultBirthdayConfig);
  const [activePanelCelebrant, setActivePanelCelebrant] = useState<TeamMember | null>(null);
  // Bumped after writing a dismissal flag so the useSyncExternalStore reads
  // below immediately reflect it, since same-tab localStorage writes don't
  // fire a "storage" event on their own.
  const [, forceSync] = useState(0);

  const currentUser = defaultTeam.find((m) => m.isYou) ?? defaultTeam[0];
  const today = useMemo(() => new Date(), []);
  const key = todayKey(today);

  const modalDismissedToday = useStoredFlag(MODAL_KEY_PREFIX + key);
  const bannerDismissed = useStoredFlag(BANNER_KEY_PREFIX + key);
  const [greetings, persistGreetings] = useStoredGreetings();

  const celebrants = config.enabled ? celebrantsToday(defaultTeam, today) : [];
  const youAreCelebrant = celebrants.some((m) => m.id === currentUser.id);
  const notificationsAllowed = config.notifyRoles.includes(role);

  function dismissModal() {
    localStorage.setItem(MODAL_KEY_PREFIX + key, "1");
    forceSync((n) => n + 1);
  }

  function dismissBanner() {
    localStorage.setItem(BANNER_KEY_PREFIX + key, "1");
    forceSync((n) => n + 1);
  }

  function addGreeting(celebrantId: string, message: string) {
    const trimmed = message.trim();
    if (!trimmed) return;
    const greeting: BirthdayGreeting = {
      id: `${celebrantId}-${Date.now()}`,
      celebrantId,
      authorName: currentUser.name,
      authorPhoto: currentUser.photo,
      message: trimmed,
      timestamp: new Date().toISOString(),
      reactions: {},
    };
    persistGreetings([greeting, ...greetings]);
  }

  function addReaction(greetingId: string, emoji: ReactionEmoji) {
    persistGreetings(
      greetings.map((g) =>
        g.id === greetingId
          ? { ...g, reactions: { ...g.reactions, [emoji]: (g.reactions[emoji] ?? 0) + 1 } }
          : g
      )
    );
  }

  const value: BirthdayContextValue = {
    config,
    updateConfig: (patch) => setConfig((prev) => ({ ...prev, ...patch })),
    team: defaultTeam,
    currentUser,
    celebrants,
    youAreCelebrant,
    notificationsAllowed,
    modalOpen: config.enabled && youAreCelebrant && !modalDismissedToday,
    dismissModal,
    bannerDismissed,
    dismissBanner,
    greetings,
    greetingsFor: (celebrantId) => greetings.filter((g) => g.celebrantId === celebrantId),
    addGreeting,
    addReaction,
    activePanelCelebrant,
    openGreetingsPanel: setActivePanelCelebrant,
    closeGreetingsPanel: () => setActivePanelCelebrant(null),
  };

  return <BirthdayContext.Provider value={value}>{children}</BirthdayContext.Provider>;
}

export function useBirthdays() {
  const context = useContext(BirthdayContext);
  if (!context) throw new Error("useBirthdays must be used within a BirthdayProvider");
  return context;
}
