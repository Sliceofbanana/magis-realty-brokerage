import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Every limiter below shares one Redis instance but gets its own prefix, so
 * a burst against one form doesn't eat into another's budget.
 */
const limiters = {
  // Public inquiry/application forms: generous enough for a real visitor
  // submitting once, tight enough to blunt a bot hammering the form.
  publicForm: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "ratelimit:public-form",
      })
    : null,
  // Login attempts: brute-force protection, looser than a form since typos happen.
  login: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "5 m"),
        prefix: "ratelimit:login",
      })
    : null,
  // Registration: infrequent by nature, so a tighter window is fine.
  register: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "60 m"),
        prefix: "ratelimit:register",
      })
    : null,
} as const;

export type RateLimitBucket = keyof typeof limiters;

/** Best-effort real client IP from the headers Vercel/most proxies set. Falls back to a shared bucket if none is present (e.g. local dev without a proxy in front). */
async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Checks and consumes one unit from the given bucket for the current
 * request's IP. If Upstash isn't configured (e.g. a fresh clone with no
 * credentials yet), this fails open — rate limiting is a hardening layer,
 * not a correctness dependency, so its absence shouldn't break the form.
 */
export async function checkRateLimit(bucket: RateLimitBucket): Promise<RateLimitResult> {
  const limiter = limiters[bucket];
  if (!limiter) return { allowed: true };

  const ip = await getClientIp();
  const { success, reset } = await limiter.limit(`${bucket}:${ip}`);
  if (success) return { allowed: true };

  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
}
