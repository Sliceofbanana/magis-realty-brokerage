/**
 * Small in-process sliding-window limiter. It is the fallback for when Redis
 * isn't configured or is unreachable: each server instance counts on its own
 * (so a serverless deployment gets a weaker, per-instance limit), which is far
 * better than no limit at all. Pure and clock-injectable so it is unit-tested.
 */
export type MemoryLimiterResult = { success: boolean; /** epoch ms when the oldest counted hit expires */ reset: number };

export function createMemoryLimiter(opts: { limit: number; windowMs: number; maxKeys?: number }, now: () => number = Date.now) {
  const hits = new Map<string, number[]>();
  const maxKeys = opts.maxKeys ?? 10_000;

  return {
    limit(key: string): MemoryLimiterResult {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((at) => t - at < opts.windowMs);

      if (recent.length >= opts.limit) {
        hits.set(key, recent);
        return { success: false, reset: recent[0] + opts.windowMs };
      }

      recent.push(t);
      hits.delete(key); // re-insert so Map order tracks recency
      hits.set(key, recent);

      // Bound memory: drop the least recently used keys.
      while (hits.size > maxKeys) {
        const oldest = hits.keys().next().value as string;
        hits.delete(oldest);
      }
      return { success: true, reset: recent[0] + opts.windowMs };
    },
  };
}
