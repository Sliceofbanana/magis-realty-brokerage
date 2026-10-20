/**
 * Pure bot-detection rules shared by every public form (no server-only deps,
 * so they are unit-tested directly). Three cheap signals, none of which a real
 * visitor ever notices:
 *  - honeypot: a field humans cannot see; bots fill it in.
 *  - timing: how long the form was open — scripts submit in milliseconds.
 *  - spam text: a message stuffed with links.
 * `lib/botGuard.ts` adds the optional Cloudflare Turnstile check on top.
 */

export type BotSignals = {
  /** Honeypot field value — must be empty. */
  hp?: string;
  /** Milliseconds the form was open before submit, measured in the browser. */
  t?: number;
  /** Cloudflare Turnstile token, when the widget is enabled. */
  cf?: string;
};

/** A person needs at least this long to fill in even the shortest form. */
export const MIN_FILL_MS = 2000;

export type SignalVerdict =
  | { ok: true }
  /** Honeypot / spam: pretend it worked so the bot learns nothing. */
  | { ok: false; silent: true }
  /** Likely a person who was too quick: tell them to retry. */
  | { ok: false; silent: false; error: string };

export function evaluateSignals(signals: BotSignals | undefined): SignalVerdict {
  if (signals?.hp && signals.hp.trim() !== "") return { ok: false, silent: true };
  const t = Number(signals?.t);
  if (!Number.isFinite(t) || t < MIN_FILL_MS) {
    return { ok: false, silent: false, error: "That was a little too fast — please try again." };
  }
  return { ok: true };
}

const URL_PATTERN = /(https?:\/\/|www\.)\S+/gi;

/** Real inquiries rarely carry more than one link; link-stuffed text is spam. */
export function looksLikeSpam(...texts: (string | undefined)[]): boolean {
  const joined = texts.filter(Boolean).join(" ");
  return (joined.match(URL_PATTERN)?.length ?? 0) > 2;
}

/** Longest value any public text field accepts (messages get more room). */
export const MAX_FIELD = 200;
export const MAX_MESSAGE = 5000;

export function tooLong(values: Record<string, string | undefined>, messageKey = "message"): boolean {
  return Object.entries(values).some(([key, v]) => (v?.length ?? 0) > (key === messageKey ? MAX_MESSAGE : MAX_FIELD));
}

/** Reads the signals SimpleForm / BotShield add to a submitted values object. */
export function botFromValues(values: Record<string, string>): BotSignals {
  return { hp: values.company_website, t: Number(values._t), cf: values._cf };
}

/** Reads the signals from a native form submission. */
export function botFromFormData(formData: FormData): BotSignals {
  return {
    hp: String(formData.get("company_website") ?? ""),
    t: Number(formData.get("_t")),
    cf: String(formData.get("_cf") ?? ""),
  };
}
