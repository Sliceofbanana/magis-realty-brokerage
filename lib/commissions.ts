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

export type CommissionRulesLike = {
  brokerageSplitPercent: number;
  tierThreshold: number;
  tierBonusPercent: number;
  withholdingTaxPercent: number;
  transactionFee: number;
};

export type CommissionSplitBreakdown = {
  grossCommission: number;
  agentSplitPercent: number;
  tierBonusApplied: boolean;
  agentEarned: number;
  estimatedWithholdingTax: number;
  transactionFee: number;
};

/**
 * Derives what an agent actually takes home from a sale price + the agreed
 * commission %, using the brokerage's Commission Rules for the split and
 * tier bonus — the deal-specific rate (commissionPercent) is the only input
 * that can't come from the rules themselves, since it varies by listing
 * agreement. Tax/fee are informational only (not subtracted from `earned`).
 */
export function computeCommissionSplit(
  salePrice: number,
  commissionPercent: number,
  rules: CommissionRulesLike
): CommissionSplitBreakdown {
  const grossCommission = salePrice * (commissionPercent / 100);
  const tierBonusApplied = salePrice >= rules.tierThreshold && rules.tierThreshold > 0;
  const agentSplitPercent =
    100 - rules.brokerageSplitPercent + (tierBonusApplied ? rules.tierBonusPercent : 0);
  const agentEarned = grossCommission * (agentSplitPercent / 100);

  return {
    grossCommission,
    agentSplitPercent,
    tierBonusApplied,
    agentEarned,
    estimatedWithholdingTax: grossCommission * (rules.withholdingTaxPercent / 100),
    transactionFee: rules.transactionFee,
  };
}

export function formatReleaseDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
