import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { clientIpFromHeaders } from "@/lib/clientIp";
import { createMemoryLimiter } from "@/lib/memoryRateLimit";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const isProduction = process.env.NODE_ENV === "production";

if (!redis && isProduction) {
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set: using per-instance in-memory limits, " +
      "which are much weaker on serverless. Configure Upstash for real brute-force protection."
  );
}

/**
 * Every bucket gets its own prefix, so a burst against one form doesn't eat
 * into another's budget.
 *  - publicForm: generous enough for a visitor submitting once, tight enough to blunt a bot.
 *  - login: brute-force protection for the login form, looser than a form since typos happen.
 *  - credentialsIp / credentialsAccount: the credential check itself (auth.ts authorize()),
 *    which the Auth.js endpoint exposes directly. One budget per IP and one per target
 *    account, so guessing is capped for a single client and for a distributed one.
 *  - passwordChange: changing your own password asks for the current one, so it is a
 *    guessing oracle for anyone holding a signed-in session. Keyed by user.
 *  - register: infrequent by nature, so a tighter window is fine.
 *  - passwordReset: blunts hammering a known email with reset mails, loose enough for a genuine retry.
 */
const BUCKETS = {
  publicForm: { limit: 5, minutes: 10 },
  login: { limit: 10, minutes: 5 },
  credentialsIp: { limit: 10, minutes: 5 },
  credentialsAccount: { limit: 10, minutes: 15 },
  passwordChange: { limit: 5, minutes: 15 },
  register: { limit: 3, minutes: 60 },
  passwordReset: { limit: 3, minutes: 15 },
} as const;

export type RateLimitBucket = keyof typeof BUCKETS;

/** The configured limits, for the System page's read-only security overview. */
export const RATE_LIMIT_BUCKETS: Record<RateLimitBucket, { limit: number; minutes: number }> = BUCKETS;

/** "redis" when Upstash is configured, else per-instance "memory" (weak on serverless). */
export const rateLimitBackend: "redis" | "memory" = redis ? "redis" : "memory";

/** Pings Upstash; rejects if it's unreachable. Only meaningful when rateLimitBackend is "redis". */
export async function pingRateLimitBackend(): Promise<void> {
  if (!redis) throw new Error("Upstash is not configured.");
  await redis.ping();
}

type Verdict = { success: boolean; reset: number };
type Limiter = { limit: (key: string) => Promise<Verdict> | Verdict };

function buildLimiter(name: RateLimitBucket): { primary: Limiter | null; fallback: Limiter | null } {
  const { limit, minutes } = BUCKETS[name];
  const memory = createMemoryLimiter({ limit, windowMs: minutes * 60_000 });
  const primary = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${minutes} m`),
        prefix: `ratelimit:${name}`,
      })
    : null;
  // Without Redis, production still limits (per instance); development stays unthrottled.
  return { primary, fallback: primary || isProduction ? memory : null };
}

const limiters = Object.fromEntries(
  (Object.keys(BUCKETS) as RateLimitBucket[]).map((name) => [name, buildLimiter(name)])
) as Record<RateLimitBucket, ReturnType<typeof buildLimiter>>;

/** Best-effort real client IP — only from headers a trusted proxy sets (see lib/clientIp.ts). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return clientIpFromHeaders((name) => h.get(name), {
    VERCEL: process.env.VERCEL,
    TRUST_PROXY: process.env.TRUST_PROXY,
  });
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Checks and consumes one unit from the given bucket for the current
 * request's IP (or `key`, e.g. an email). Uses Redis when configured; if Redis
 * is missing in production or errors out, the in-memory limiter answers instead
 * so a Redis outage degrades protection rather than removing it.
 */
export async function checkRateLimit(bucket: RateLimitBucket, key?: string): Promise<RateLimitResult> {
  const { primary, fallback } = limiters[bucket];
  const subject = `${bucket}:${key ?? (await getClientIp())}`;

  let verdict: Verdict | null = null;
  if (primary) {
    try {
      verdict = await primary.limit(subject);
    } catch (err) {
      console.error(`[rate-limit] Redis check failed for "${bucket}", using in-memory limit:`, err);
    }
  }
  if (!verdict && fallback) verdict = await fallback.limit(subject);
  if (!verdict || verdict.success) return { allowed: true };

  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((verdict.reset - Date.now()) / 1000)) };
}
