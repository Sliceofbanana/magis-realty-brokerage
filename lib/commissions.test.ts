import { describe, it, expect } from "vitest";
import { releaseStatusFor, commissionReleaseSummary } from "@/lib/commissions";
import type { CommissionRecord } from "@/lib/types";

describe("releaseStatusFor", () => {
  it("is pending-initial when nothing has been released", () => {
    expect(releaseStatusFor(0, 100_000)).toBe("pending-initial");
  });

  it("is partially-released when some but not all has been released", () => {
    expect(releaseStatusFor(40_000, 100_000)).toBe("partially-released");
  });

  it("is fully-released once released equals earned", () => {
    expect(releaseStatusFor(100_000, 100_000)).toBe("fully-released");
  });

  it("treats over-release (e.g. a correction) as fully-released, not an error", () => {
    expect(releaseStatusFor(105_000, 100_000)).toBe("fully-released");
  });
});

describe("commissionReleaseSummary", () => {
  const records: CommissionRecord[] = [
    {
      id: "r1",
      property: "The Azure Penthouse",
      closedDate: "2026-01-10",
      earned: 100_000,
      releases: [
        { id: "rel1", date: "2026-01-15", amount: 40_000 },
        { id: "rel2", date: "2026-02-15", amount: 60_000 },
      ],
    },
    {
      id: "r2",
      property: "Nexus Center",
      closedDate: "2026-02-01",
      earned: 50_000,
      releases: [],
    },
  ];

  it("sums earned and released across all records", () => {
    const summary = commissionReleaseSummary(records);
    expect(summary.totalEarned).toBe(150_000);
    expect(summary.totalReleased).toBe(100_000);
    expect(summary.remaining).toBe(50_000);
  });

  it("computes releasedPct against the total, not per-record", () => {
    const summary = commissionReleaseSummary(records);
    expect(summary.releasedPct).toBeCloseTo((100_000 / 150_000) * 100, 5);
  });

  it("marks a fully-paid record as fully-released and an untouched one as pending-initial", () => {
    const summary = commissionReleaseSummary(records);
    const fullyPaid = records[0];
    const untouched = records[1];
    const fullyPaidStats = summary.records.find((r) => r.record.id === fullyPaid.id)!;
    const untouchedStats = summary.records.find((r) => r.record.id === untouched.id)!;
    expect(fullyPaidStats.status).toBe("fully-released");
    expect(fullyPaidStats.remaining).toBe(0);
    expect(untouchedStats.status).toBe("pending-initial");
    expect(untouchedStats.remaining).toBe(50_000);
  });

  it("sorts the timeline newest-first across records", () => {
    const summary = commissionReleaseSummary(records);
    const dates = summary.timeline.map((t) => t.date);
    expect(dates).toEqual(["2026-02-15", "2026-01-15"]);
    expect(summary.lastRelease?.date).toBe("2026-02-15");
  });

  it("overall status reflects the combined released amount, not any single record", () => {
    // 100k released of 150k earned overall — neither record alone is
    // "partially-released" in isolation for both, but the combined total is.
    const summary = commissionReleaseSummary(records);
    expect(summary.overallStatus).toBe("partially-released");
  });

  it("returns a zeroed, non-crashing summary for an empty record set", () => {
    const summary = commissionReleaseSummary([]);
    expect(summary.totalEarned).toBe(0);
    expect(summary.totalReleased).toBe(0);
    expect(summary.releasedPct).toBe(0);
    expect(summary.overallStatus).toBe("pending-initial");
    expect(summary.lastRelease).toBeUndefined();
  });

  it("never reports negative remaining even if releases somehow exceed earned", () => {
    const overReleased: CommissionRecord[] = [
      {
        id: "r3",
        property: "Test",
        closedDate: "2026-01-01",
        earned: 10_000,
        releases: [{ id: "rel3", date: "2026-01-05", amount: 12_000 }],
      },
    ];
    const summary = commissionReleaseSummary(overReleased);
    expect(summary.remaining).toBe(0);
    expect(summary.records[0].remaining).toBe(0);
  });
});
