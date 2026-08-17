import type { Prisma } from "@prisma/client";
import type { AttendanceConfig, AttendanceSession, AttendanceType, AttendanceSessionStatus } from "@/lib/types";

export const attendanceConfigWithTiers = {
  rewardTiers: true,
} satisfies Prisma.AttendanceConfigInclude;

type AttendanceConfigWithTiers = Prisma.AttendanceConfigGetPayload<{
  include: typeof attendanceConfigWithTiers;
}>;

const periodLabel: Record<string, AttendanceConfig["period"]> = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  YEARLY: "yearly",
};

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Used when the singleton AttendanceConfig row hasn't been seeded yet. */
export const fallbackAttendanceConfig: AttendanceConfig = {
  period: "quarterly",
  periodLabel: "No active cycle",
  periodStart: "2000-01-01",
  asOf: "2000-01-01",
  pointsPerMeeting: 0,
  pointsPerPks: 0,
  eligibilityMinRate: 0,
  rewardTiers: [],
};

/** Maps the singleton Prisma AttendanceConfig+RewardTier[] row to the pure-logic shape. */
export function toAttendanceConfig(row: AttendanceConfigWithTiers): AttendanceConfig {
  return {
    period: periodLabel[row.period] ?? "quarterly",
    periodLabel: row.periodLabel,
    periodStart: toDateString(row.periodStart),
    asOf: toDateString(row.asOf),
    pointsPerMeeting: row.pointsPerMeeting,
    pointsPerPks: row.pointsPerPks,
    eligibilityMinRate: row.eligibilityMinRate,
    rewardTiers: row.rewardTiers.map((t) => ({ points: t.points, label: t.label })),
  };
}

export const attendanceRecordWithMeeting = {
  meeting: true,
} satisfies Prisma.AttendanceRecordInclude;

type AttendanceRecordWithMeeting = Prisma.AttendanceRecordGetPayload<{
  include: typeof attendanceRecordWithMeeting;
}>;

const typeLabel: Record<string, AttendanceType> = {
  MEETING: "meeting",
  PKS: "pks",
};

const statusLabel: Record<string, AttendanceSessionStatus> = {
  ATTENDED: "attended",
  MISSED: "missed",
  UPCOMING: "upcoming",
};

/** Maps one agent's AttendanceRecord[] (joined with Meeting) to AttendanceSession[]. */
export function toAttendanceSessions(records: AttendanceRecordWithMeeting[]): AttendanceSession[] {
  return records.map((r) => ({
    id: r.id,
    type: typeLabel[r.meeting.type] ?? "meeting",
    title: r.meeting.title,
    date: toDateString(r.meeting.date),
    status: statusLabel[r.status] ?? "upcoming",
  }));
}
