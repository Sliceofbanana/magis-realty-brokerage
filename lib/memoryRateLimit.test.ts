import { describe, expect, it } from "vitest";
import { createMemoryLimiter } from "@/lib/memoryRateLimit";

describe("createMemoryLimiter", () => {
  it("allows up to the limit, then blocks, and reports when it frees up", () => {
    let t = 1_000;
    const l = createMemoryLimiter({ limit: 3, windowMs: 10_000 }, () => t);
    expect(l.limit("ip").success).toBe(true);
    t += 1_000;
    expect(l.limit("ip").success).toBe(true);
    t += 1_000;
    expect(l.limit("ip").success).toBe(true);
    t += 1_000;
    const blocked = l.limit("ip");
    expect(blocked.success).toBe(false);
    expect(blocked.reset).toBe(1_000 + 10_000);
  });

  it("slides: old hits age out and capacity returns", () => {
    let t = 0;
    const l = createMemoryLimiter({ limit: 2, windowMs: 1_000 }, () => t);
    l.limit("k");
    l.limit("k");
    expect(l.limit("k").success).toBe(false);
    t = 1_001;
    expect(l.limit("k").success).toBe(true);
  });

  it("counts keys independently", () => {
    const l = createMemoryLimiter({ limit: 1, windowMs: 1_000 }, () => 0);
    expect(l.limit("a").success).toBe(true);
    expect(l.limit("a").success).toBe(false);
    expect(l.limit("b").success).toBe(true);
  });

  it("does not let blocked attempts extend the block", () => {
    let t = 0;
    const l = createMemoryLimiter({ limit: 1, windowMs: 1_000 }, () => t);
    l.limit("k");
    for (t = 100; t < 900; t += 100) l.limit("k"); // hammering while blocked
    t = 1_001;
    expect(l.limit("k").success).toBe(true);
  });

  it("evicts the least recently used keys beyond maxKeys", () => {
    const l = createMemoryLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 }, () => 0);
    l.limit("a");
    l.limit("b");
    l.limit("c"); // evicts a
    expect(l.limit("a").success).toBe(true); // forgotten, so allowed again
    expect(l.limit("c").success).toBe(false);
  });
});
