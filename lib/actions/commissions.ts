"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CommissionActionResult = { error?: string; success?: boolean };

const ALLOWED_ROLES = ["ADMINISTRATOR", "BROKER"];

/** Creates a new commission record — Administrators and Brokers only. */
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
  const earnedRaw = String(formData.get("earned") ?? "").trim();

  if (!agentId) return { error: "Select an agent." };
  if (!propertyLabel) return { error: "Property name is required." };
  if (!closedDateRaw) return { error: "Closed date is required." };
  const earned = Number(earnedRaw);
  if (!earnedRaw || Number.isNaN(earned) || earned <= 0) return { error: "Enter a valid commission amount." };

  const agent = await prisma.user.findUnique({ where: { id: agentId }, select: { id: true } });
  if (!agent) return { error: "Selected agent not found." };

  await prisma.commissionRecord.create({
    data: {
      agentId,
      propertyId: propertyId || null,
      propertyLabel,
      closedDate: new Date(closedDateRaw),
      earned,
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
