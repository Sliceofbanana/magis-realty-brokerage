/**
 * Response headers applied to every route (see next.config.ts).
 *
 * The CSP is deliberately not nonce-based: a nonce forces every page to render
 * dynamically, which would turn off static/ISR rendering on the public site.
 * It still blocks the things that matter most here — framing (clickjacking),
 * plugins, <base> and form-target hijacking, and loading script, frames or
 * connections from anywhere but the origins below. `'unsafe-inline'` for
 * scripts is what Next's inline bootstrap needs without a nonce; moving to
 * nonces is the next step if that trade-off should be closed.
 */

const TURNSTILE = "https://challenges.cloudflare.com";

/** Origins images may load from — keep in sync with images.remotePatterns in next.config.ts. */
const IMAGE_ORIGINS = ["https://res.cloudinary.com", "https://images.unsplash.com", "https://picsum.photos"];

export type HeaderEntry = { key: string; value: string };

export function buildSecurityHeaders(isProduction: boolean): HeaderEntry[] {
  const csp = [
    "default-src 'self'",
    // React needs eval in development only (stack reconstruction).
    `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} ${TURNSTILE}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${IMAGE_ORIGINS.join(" ")}`,
    "font-src 'self' data:",
    // The dev server's hot reload uses a websocket back to itself.
    `connect-src 'self' ${TURNSTILE}${isProduction ? "" : " ws: wss:"}`,
    // Google Maps embeds on the contact and property pages; Turnstile's challenge frame.
    `frame-src https://www.google.com ${TURNSTILE}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  const headers: HeaderEntry[] = [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Legacy equivalent of frame-ancestors for browsers that ignore CSP.
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
  if (isProduction) {
    // One year, no includeSubDomains/preload: those are irreversible-ish and need a deliberate decision.
    headers.push({ key: "Strict-Transport-Security", value: "max-age=31536000" });
  }
  return headers;
}
