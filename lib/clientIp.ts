/**
 * Picks the client's IP out of request headers — but only from headers a
 * trusted proxy sets. `X-Forwarded-For` / `X-Real-IP` are just request headers:
 * unless a proxy in front of the app overwrites them, a client can send any
 * value and so dodge every per-IP limit by changing it on each request.
 *
 * Trusted when running on Vercel (it overwrites them), or when the operator
 * sets TRUST_PROXY=1 because their own reverse proxy does. Otherwise returns
 * "unknown", which puts everyone in one shared bucket — stricter, never weaker.
 */
export function clientIpFromHeaders(
  get: (name: string) => string | null,
  env: Partial<Record<"VERCEL" | "TRUST_PROXY", string | undefined>>
): string {
  const proxyIsTrusted = Boolean(env.VERCEL) || env.TRUST_PROXY === "1";
  if (!proxyIsTrusted) return "unknown";

  const forwardedFor = get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  if (first) return first;
  return get("x-real-ip")?.trim() || "unknown";
}
