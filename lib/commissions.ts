import { CommissionRecord, CommissionRelease } from "@/lib/types";

export type ReleaseStatus = "fully-released" | "partially-released" | "pending-initial";

export type RecordStats = {
  record: CommissionRecord;
  released: number;
  remaining: number;
  releasedPct: number;
  status: ReleaseStatus;
};

export type TimelineEntry = CommissionRelease & { property: string };

export type CommissionReleaseSummary = {
  totalEarned: number;
  totalReleased: number;
  remaining: number;
  releasedPct: number;
  releaseCount: number;
  lastRelease?: TimelineEntry;
  overallStatus: ReleaseStatus;
  records: RecordStats[];
  timeline: TimelineEntry[];
};

export function releaseStatusFor(released: number, earned: number): ReleaseStatus {
  if (released <= 0) return "pending-initial";
  return released >= earned ? "fully-released" : "partially-released";
}

export function commissionReleaseSummary(
  records: CommissionRecord[]
): CommissionReleaseSummary {
  const recordStats: RecordStats[] = records.map((record) => {
    const released = record.releases.reduce((sum, r) => sum + r.amount, 0);
    return {
      record,
      released,
      remaining: Math.max(0, record.earned - released),
      releasedPct: record.earned > 0 ? (released / record.earned) * 100 : 0,
      status: releaseStatusFor(released, record.earned),
    };
  });

  const totalEarned = recordStats.reduce((sum, r) => sum + r.record.earned, 0);
  const totalReleased = recordStats.reduce((sum, r) => sum + r.released, 0);

  const timeline: TimelineEntry[] = records
    .flatMap((record) => record.releases.map((r) => ({ ...r, property: record.property })))
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    totalEarned,
    totalReleased,
    remaining: Math.max(0, totalEarned - totalReleased),
    releasedPct: totalEarned > 0 ? (totalReleased / totalEarned) * 100 : 0,
    releaseCount: timeline.length,
    lastRelease: timeline[0],
    overallStatus: releaseStatusFor(totalReleased, totalEarned),
    records: recordStats,
    timeline,
  };
}

export function formatReleaseDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
