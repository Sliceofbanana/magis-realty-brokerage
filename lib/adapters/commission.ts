import type { Prisma } from "@prisma/client";
import type { CommissionRecord, Transaction } from "@/lib/types";
import { releaseStatusFor } from "@/lib/commissions";

export const commissionRecordInclude = {
  agent: { select: { id: true, name: true, photo: true } },
  property: { select: { title: true, location: true, price: true } },
  releases: true,
} satisfies Prisma.CommissionRecordInclude;

type CommissionRecordWithRelations = Prisma.CommissionRecordGetPayload<{
  include: typeof commissionRecordInclude;
}>;

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Maps a Prisma CommissionRecord row (+ releases) to the pure lib/commissions.ts shape. */
export function toCommissionRecord(r: CommissionRecordWithRelations): CommissionRecord {
  return {
    id: r.id,
    property: r.property?.title ?? r.propertyLabel,
    closedDate: toDateString(r.closedDate),
    earned: Number(r.earned),
    releases: r.releases.map((rel) => ({
      id: rel.id,
      date: toDateString(rel.date),
      amount: Number(rel.amount),
      note: rel.note ?? undefined,
    })),
  };
}

const transactionStatusLabel: Record<ReturnType<typeof releaseStatusFor>, Transaction["status"]> = {
  "fully-released": "Paid",
  "partially-released": "Pending",
  "pending-initial": "In Review",
};

/** Derives the Commissions admin table's row shape from a real record + its release total. */
export function toTransactionRow(
  r: CommissionRecordWithRelations,
  released: number
): Transaction {
  const earned = Number(r.earned);
  const salePrice = r.property?.price ? Number(r.property.price) : earned;
  return {
    id: r.id,
    property: r.property?.title ?? r.propertyLabel,
    location: r.property?.location ?? "—",
    image: "",
    closedDate: toDateString(r.closedDate),
    salePrice,
    commissionPercent: salePrice > 0 ? Math.round((earned / salePrice) * 1000) / 10 : 0,
    commissionAmount: earned,
    status: transactionStatusLabel[releaseStatusFor(released, earned)],
  };
}
