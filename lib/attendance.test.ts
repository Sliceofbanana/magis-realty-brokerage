import { describe, it, expect } from "vitest";
import { badgeFor, attendanceSummary } from "@/lib/attendance";
import type { AttendanceSession, AttendanceConfig } from "@/lib/types";

const config: AttendanceConfig = {
  period: "monthly",
  periodLabel: "November 2023",
  periodStart: "2023-11-01",
  asOf: "2023-11-30",
  pointsPerMeeting: 2,
  pointsPerPks: 4,
  eligibilityMinRate: 75,
  rewardTiers: [
    { points: 25, label: "Bronze" },
    { points: 50, label: "Silver" },
    { points: 75, label: "Gold" },
  ],
};

function session(
  overrides: Partial<AttendanceSession> & Pick<AttendanceSession, "id" | "date" | "status" | "type">
): AttendanceSession {
  return { title: "Session", ...overrides };
}

describe("badgeFor", () => {
  it("is excellent at 90%+", () => {
    expect(badgeFor(90)).toBe("excellent");
    expect(badgeFor(100)).toBe("excellent");
  });

  it("is good between 75% and just under 90%", () => {
    expect(badgeFor(75)).toBe("good");
    expect(badgeFor(89.9)).toBe("good");
  });

  it("is needs-improvement under 75%", () => {
    expect(badgeFor(74.9)).toBe("needs-improvement");
    expect(badgeFor(0)).toBe("needs-improvement");
  });
});

describe("attendanceSummary", () => {
  it("computes points only from attended sessions, weighted by type", () => {
    const sessions: AttendanceSession[] = [
      session({ id: "1", type: "meeting", date: "2023-11-05", status: "attended" }),
      session({ id: "2", type: "meeting", date: "2023-11-12", status: "missed" }),
      session({ id: "3", type: "pks", date: "2023-11-10", status: "attended" }),
    ];
    const summary = attendanceSummary(sessions, config);
    // 1 attended meeting (2 pts) + 1 attended PKS (4 pts) = 6 pts. The missed
    // meeting contributes nothing.
    expect(summary.totalPoints).toBe(6);
  });

  it("ignores upcoming sessions when computing rates and points", () => {
    const sessions: AttendanceSession[] = [
      session({ id: "1", type: "meeting", date: "2023-11-05", status: "attended" }),
      session({ id: "2", type: "meeting", date: "2023-12-01", status: "upcoming" }),
    ];
    const summary = attendanceSummary(sessions, config);
    expect(summary.meetings.scheduled).toBe(1);
    expect(summary.meetings.nextUpcoming?.id).toBe("2");
  });

  it("excludes sessions outside the config's period window", () => {
    const sessions: AttendanceSession[] = [
      session({ id: "1", type: "meeting", date: "2023-10-15", status: "attended" }), // before periodStart
      session({ id: "2", type: "meeting", date: "2023-11-05", status: "attended" }), // in period
    ];
    const summary = attendanceSummary(sessions, config);
    expect(summary.meetings.scheduled).toBe(1);
    expect(summary.meetings.attended).toBe(1);
  });

  it("determines eligibility from overall rate against the configured minimum", () => {
    const allAttended: AttendanceSession[] = [
      session({ id: "1", type: "meeting", date: "2023-11-01", status: "attended" }),
      session({ id: "2", type: "meeting", date: "2023-11-08", status: "attended" }),
    ];
    expect(attendanceSummary(allAttended, config).eligible).toBe(true);

    const mostlyMissed: AttendanceSession[] = [
      session({ id: "1", type: "meeting", date: "2023-11-01", status: "attended" }),
      session({ id: "2", type: "meeting", date: "2023-11-08", status: "missed" }),
      session({ id: "3", type: "meeting", date: "2023-11-15", status: "missed" }),
      session({ id: "4", type: "meeting", date: "2023-11-22", status: "missed" }),
    ];
    expect(attendanceSummary(mostlyMissed, config).eligible).toBe(false);
  });

  it("identifies the current streak as consecutive attended sessions ending at the most recent", () => {
    const sessions: AttendanceSession[] = [
      session({ id: "1", type: "meeting", date: "2023-11-01", status: "missed" }),
      session({ id: "2", type: "meeting", date: "2023-11-08", status: "attended" }),
      session({ id: "3", type: "meeting", date: "2023-11-15", status: "attended" }),
    ];
    const summary = attendanceSummary(sessions, config);
    expect(summary.meetings.currentStreak).toBe(2);
  });

  it("resets the current streak to 0 if the most recent session was missed", () => {
    const sessions: AttendanceSession[] = [
      session({ id: "1", type: "meeting", date: "2023-11-01", status: "attended" }),
      session({ id: "2", type: "meeting", date: "2023-11-08", status: "missed" }),
    ];
    const summary = attendanceSummary(sessions, config);
    expect(summary.meetings.currentStreak).toBe(0);
  });

  it("finds the next reward tier and points remaining to reach it", () => {
    const sessions: AttendanceSession[] = [
      session({ id: "1", type: "meeting", date: "2023-11-01", status: "attended" }), // 2 pts
    ];
    const summary = attendanceSummary(sessions, config);
    expect(summary.nextTier?.label).toBe("Bronze");
    expect(summary.pointsRemaining).toBe(23);
  });

  it("has no next tier once every tier is earned", () => {
    const sessions: AttendanceSession[] = Array.from({ length: 20 }, (_, i) =>
      session({ id: `m${i}`, type: "meeting", date: `2023-11-${String(i + 1).padStart(2, "0")}`, status: "attended" })
    );
    // 20 attended meetings * 2 pts = 40... not enough for Gold (75), bump with PKS too.
    const withPks = [
      ...sessions,
      ...Array.from({ length: 10 }, (_, i) =>
        session({ id: `p${i}`, type: "pks" as const, date: `2023-11-${String(i + 1).padStart(2, "0")}`, status: "attended" as const })
      ),
    ];
    const summary = attendanceSummary(withPks, config);
    // 20*2 + 10*4 = 80 pts, clears all three tiers (25/50/75).
    expect(summary.totalPoints).toBe(80);
    expect(summary.nextTier).toBeUndefined();
    expect(summary.progressToNextPct).toBe(100);
    expect(summary.earnedTiers.map((t) => t.label)).toEqual(["Bronze", "Silver", "Gold"]);
  });

  it("returns a zeroed, non-crashing summary for no sessions at all", () => {
    const summary = attendanceSummary([], config);
    expect(summary.overallRate).toBe(0);
    expect(summary.totalPoints).toBe(0);
    expect(summary.eligible).toBe(false); // 0% rate never meets a positive minimum
    expect(summary.lastAttended).toBeUndefined();
  });
});
