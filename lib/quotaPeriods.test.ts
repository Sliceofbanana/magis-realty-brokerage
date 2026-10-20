import { describe, it, expect } from "vitest";
import { currentQuotaPeriods } from "@/lib/quotaPeriods";

const byId = (now: string) => Object.fromEntries(currentQuotaPeriods(new Date(now)).map((p) => [p.id, p]));

describe("currentQuotaPeriods", () => {
  it("builds Mon–Sun, calendar-month, and calendar-quarter cycles around today (Manila time)", () => {
    // Wed Oct 21 2026, midday in Manila
    const p = byId("2026-10-21T04:00:00Z");
    expect(p.weekly).toMatchObject({ start: "2026-10-19", end: "2026-10-25", asOf: "2026-10-21" });
    expect(p.weekly.cycleLabel).toBe("Week of Oct 19 – 25, 2026");
    expect(p.monthly).toMatchObject({ start: "2026-10-01", end: "2026-10-31" });
    expect(p.monthly.cycleLabel).toBe("October 2026 Cycle");
    expect(p.quarterly).toMatchObject({ start: "2026-10-01", end: "2026-12-31" });
    expect(p.quarterly.cycleLabel).toBe("Q4 2026 Performance Cycle");
  });

  it("treats Sunday as the last day of the week and labels weeks that span two months", () => {
    // Sun Nov 1 2026 → week is Mon Oct 26 – Sun Nov 1
    const p = byId("2026-11-01T04:00:00Z");
    expect(p.weekly).toMatchObject({ start: "2026-10-26", end: "2026-11-01" });
    expect(p.weekly.cycleLabel).toBe("Week of Oct 26 – Nov 1, 2026");
  });

  it("uses the Manila calendar date, not UTC", () => {
    // 17:00 UTC on Oct 31 is already Nov 1 in Manila (UTC+8)
    const p = byId("2026-10-31T17:00:00Z");
    expect(p.monthly.start).toBe("2026-11-01");
    expect(p.weekly.asOf).toBe("2026-11-01");
  });

  it("handles leap-year February and the first quarter", () => {
    const p = byId("2028-02-10T04:00:00Z");
    expect(p.monthly.end).toBe("2028-02-29");
    expect(p.quarterly).toMatchObject({ start: "2028-01-01", end: "2028-03-31" });
  });
});
