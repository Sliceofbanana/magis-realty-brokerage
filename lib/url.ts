import { headers } from "next/headers";

type UrlEnv = Partial<Record<"AUTH_URL" | "NEXTAUTH_URL" | "VERCEL_PROJECT_PRODUCTION_URL" | "NODE_ENV", string | undefined>>;

/**
 * The site's own origin from configuration, or null when none is set. Used for
 * links that get emailed (password reset, email verification, invitations): the
 * `Host` header is chosen by whoever sent the request, so building a reset link
 * from it would let an attacker make the site email a victim a link to a domain
 * the attacker controls.
 */
export function configuredOrigin(env: UrlEnv): string | null {
  const configured = env.AUTH_URL || env.NEXTAUTH_URL;
  const candidate =
    configured ||
    (env.NODE_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

/**
 * Origin for links that leave the site by email. Uses configuration
 * (AUTH_URL / NEXTAUTH_URL, or Vercel's production URL). Only in development
 * does it fall back to the request, so a missing setting there is harmless;
 * in production a missing setting is an error rather than a silent fallback
 * to an attacker-controllable header.
 */
export async function getPublicBaseUrl(): Promise<string> {
  const origin = configuredOrigin(process.env);
  if (origin) return origin;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Set NEXTAUTH_URL (or AUTH_URL) to the site's public URL so emailed links can be built safely.");
  }
  return getBaseUrl();
}

/**
 * Origin of the current request — for links meant to be opened on another
 * device on the same network (e.g. the attendance QR codes shown to the admin
 * who is already using that origin). Not for anything that is emailed.
 */
export async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const forwarded = h.get("x-forwarded-proto");
  const proto = forwarded === "http" || forwarded === "https" ? forwarded : host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}
