import { describe, it, expect } from "vitest";
import { periodMath, quotaStats, formatCompactUsd } from "@/lib/quota";
import type { QuotaPeriod } from "@/lib/data/leaderboard";

const period: QuotaPeriod = {
  id: "quarterly",
  label: "Q4 2023 Performance Cycle",
  cycleLabel: "Q4 2023",
  start: "2023-10-01",
  end: "2023-12-31",
  asOf: "2023-11-15", // 46 days into a 92-day period
};

describe("periodMath", () => {
  it("computes total, elapsed, and remaining days inclusively", () => {
    const { totalDays, elapsedDays, remainingDays } = periodMath(period);
    expect(totalDays).toBe(92);
    expect(elapsedDays).toBe(46);
    expect(remainingDays).toBe(46);
  });

  it("clamps elapsedDays to at least 1 on the period's start date", () => {
    const startOfPeriod: QuotaPeriod = { ...period, asOf: period.start };
    const { elapsedDays } = periodMath(startOfPeriod);
    expect(elapsedDays).toBe(1);
  });

  it("clamps elapsedDays to totalDays when asOf is after the period ends", () => {
    const afterEnd: QuotaPeriod = { ...period, asOf: "2024-01-15" };
    const { elapsedDays, totalDays, remainingDays } = periodMath(afterEnd);
    expect(elapsedDays).toBe(totalDays);
    expect(remainingDays).toBe(1); // never zero — avoids a divide-by-zero in requiredPerDay
  });
});

describe("quotaStats", () => {
  it("marks quota as achieved once progress reaches 100%", () => {
    const stats = quotaStats(1_000_000, 1_000_000, period);
    expect(stats.status).toBe("achieved");
    expect(stats.remaining).toBe(0);
  });

  it("never reports negative remaining when achieved exceeds quota", () => {
    const stats = quotaStats(1_000_000, 1_500_000, period);
    expect(stats.remaining).toBe(0);
  });

  it("computes progressPct proportionally to quota", () => {
    const stats = quotaStats(1_000_000, 250_000, period);
    expect(stats.progressPct).toBeCloseTo(25, 5);
  });

  it("flags an agent as on-track when progress roughly matches time elapsed", () => {
    // 46/92 days elapsed = 50% of the period; matching progress should read on-track.
    const stats = quotaStats(1_000_000, 500_000, period);
    expect(stats.status).toBe("on-track");
  });

  it("flags an agent as behind when progress lags far behind elapsed time", () => {
    const stats = quotaStats(1_000_000, 50_000, period);
    expect(stats.status).toBe("behind");
  });

  it("does not divide by zero when quota is 0", () => {
    const stats = quotaStats(0, 0, period);
    expect(stats.progressPct).toBe(0);
    expect(Number.isFinite(stats.projectedPct)).toBe(true);
  });
});

describe("formatCompactUsd", () => {
  it("formats millions with one decimal at 10M+", () => {
    expect(formatCompactUsd(14_200_000)).toBe("$14.2M");
  });

  it("formats sub-10M millions with a trimmed trailing zero", () => {
    expect(formatCompactUsd(2_500_000)).toBe("$2.5M");
  });

  it("formats thousands rounded, no decimals", () => {
    expect(formatCompactUsd(277_000)).toBe("$277K");
  });

  it("formats small values as a plain rounded dollar amount", () => {
    expect(formatCompactUsd(842)).toBe("$842");
  });
});
