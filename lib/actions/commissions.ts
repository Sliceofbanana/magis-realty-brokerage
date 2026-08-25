"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeCommissionSplit } from "@/lib/commissions";
import { getCommissionRules } from "@/lib/actions/commissionRules";

export type CommissionActionResult = { error?: string; success?: boolean };

const ALLOWED_ROLES = ["ADMINISTRATOR", "BROKER"];

/** Creates a new commission record — Administrators and Brokers only. Commission split is always
 *  recomputed server-side from Commission Rules; the client-sent breakdown is preview-only. */
export async function createCommissionRecordAction(
  _prevState: CommissionActionResult,
  formData: FormData
): Promise<CommissionActionResult> {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return { error: "Not authorized." };
  }

  const agentId = String(formData.get("agentId") ?? "").trim();
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const propertyLabel = String(formData.get("propertyLabel") ?? "").trim();
  const closedDateRaw = String(formData.get("closedDate") ?? "").trim();
  const salePriceRaw = String(formData.get("salePrice") ?? "").trim();
  const commissionPercentRaw = String(formData.get("commissionPercent") ?? "").trim();

  if (!agentId) return { error: "Select an agent." };
  if (!propertyLabel) return { error: "Property name is required." };
  if (!closedDateRaw) return { error: "Closed date is required." };
  const salePrice = Number(salePriceRaw);
  if (!salePriceRaw || Number.isNaN(salePrice) || salePrice <= 0) {
    return { error: "Enter a valid sale price." };
  }
  const commissionPercent = Number(commissionPercentRaw);
  if (!commissionPercentRaw || Number.isNaN(commissionPercent) || commissionPercent <= 0) {
    return { error: "Enter a valid commission percentage." };
  }

  const agent = await prisma.user.findUnique({ where: { id: agentId }, select: { id: true } });
  if (!agent) return { error: "Selected agent not found." };

  const rules = await getCommissionRules();
  const { agentEarned } = computeCommissionSplit(salePrice, commissionPercent, rules);

  await prisma.commissionRecord.create({
    data: {
      agentId,
      propertyId: propertyId || null,
      propertyLabel,
      closedDate: new Date(closedDateRaw),
      earned: agentEarned,
    },
  });

  revalidatePath("/portal/commissions");
  revalidatePath("/portal");
  return { success: true };
}

/** Logs a release payment against an existing commission record — Administrators and Brokers only. */
export async function addCommissionReleaseAction(
  recordId: string,
  _prevState: CommissionActionResult,
  formData: FormData
): Promise<CommissionActionResult> {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return { error: "Not authorized." };
  }

  const dateRaw = String(formData.get("date") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!dateRaw) return { error: "Release date is required." };
  const amount = Number(amountRaw);
  if (!amountRaw || Number.isNaN(amount) || amount <= 0) return { error: "Enter a valid release amount." };

  const record = await prisma.commissionRecord.findUnique({ where: { id: recordId }, select: { id: true } });
  if (!record) return { error: "Commission record not found." };

  await prisma.commissionRelease.create({
    data: { recordId, date: new Date(dateRaw), amount, note: note || null },
  });

  revalidatePath("/portal/commissions");
  revalidatePath("/portal");
  return { success: true };
}
