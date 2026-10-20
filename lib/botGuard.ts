import "server-only";
import { evaluateSignals, type BotSignals } from "@/lib/botSignals";
import { getClientIp } from "@/lib/rateLimit";

export type BotCheck = { ok: true } | { ok: false; silent: boolean; error: string };

/**
 * Server-side gate for every public form. Runs the honeypot + timing rules and,
 * when Cloudflare Turnstile keys are configured (NEXT_PUBLIC_TURNSTILE_SITE_KEY +
 * TURNSTILE_SECRET_KEY), verifies the CAPTCHA token too. Without keys only the
 * invisible checks run, so the site works before Turnstile is set up.
 * `silent: true` means "pretend it succeeded" (honeypot hit).
 */
export async function checkBot(signals: BotSignals | undefined): Promise<BotCheck> {
  const verdict = evaluateSignals(signals);
  if (!verdict.ok) return { ok: false, silent: verdict.silent, error: verdict.silent ? "" : verdict.error };

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return { ok: true };

  const token = signals?.cf?.trim();
  if (!token) {
    return { ok: false, silent: false, error: "Please wait for the security check to finish, then try again." };
  }
  try {
    const body = new URLSearchParams({ secret, response: token });
    const ip = await getClientIp();
    if (ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(4000),
    });
    const data = (await res.json()) as { success?: boolean };
    if (data.success) return { ok: true };
    return { ok: false, silent: false, error: "Security check failed — please refresh the page and try again." };
  } catch {
    // Cloudflare unreachable: do not lose a real enquiry over it. The honeypot,
    // timing and per-IP rate limits still apply.
    return { ok: true };
  }
}
