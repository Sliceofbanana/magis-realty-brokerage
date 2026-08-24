"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/users";

export type CommissionRules = {
  brokerageSplitPercent: number;
  referralFeePercent: number;
  tierThreshold: number;
  tierBonusPercent: number;
  withholdingTaxPercent: number;
  transactionFee: number;
  effectiveDate: string;
  autoCalculationEnabled: boolean;
};

const fallbackCommissionRules: CommissionRules = {
  brokerageSplitPercent: 20,
  referralFeePercent: 10,
  tierThreshold: 5000000,
  tierBonusPercent: 5,
  withholdingTaxPercent: 12,
  transactionFee: 2500,
  effectiveDate: "2024-01-01",
  autoCalculationEnabled: true,
};

/** Returns the singleton commission rules row (or sensible defaults if never saved). */
export async function getCommissionRules(): Promise<CommissionRules> {
  const row = await prisma.commissionRules.findUnique({ where: { id: "singleton" } });
  if (!row) return fallbackCommissionRules;

  return {
    brokerageSplitPercent: Number(row.brokerageSplitPercent),
    referralFeePercent: Number(row.referralFeePercent),
    tierThreshold: Number(row.tierThreshold),
    tierBonusPercent: Number(row.tierBonusPercent),
    withholdingTaxPercent: Number(row.withholdingTaxPercent),
    transactionFee: Number(row.transactionFee),
    effectiveDate: row.effectiveDate.toISOString().slice(0, 10),
    autoCalculationEnabled: row.autoCalculationEnabled,
  };
}

export type CommissionRulesUpdateResult = { error?: string; success?: boolean };

/** Admin-only: upserts the singleton commission rules row. */
export async function updateCommissionRulesAction(
  values: CommissionRules
): Promise<CommissionRulesUpdateResult> {
  await requireAdmin();

  const data = {
    brokerageSplitPercent: values.brokerageSplitPercent,
    referralFeePercent: values.referralFeePercent,
    tierThreshold: values.tierThreshold,
    tierBonusPercent: values.tierBonusPercent,
    withholdingTaxPercent: values.withholdingTaxPercent,
    transactionFee: values.transactionFee,
    effectiveDate: new Date(values.effectiveDate),
    autoCalculationEnabled: values.autoCalculationEnabled,
  };

  await prisma.commissionRules.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/portal/settings");
  return { success: true };
}
