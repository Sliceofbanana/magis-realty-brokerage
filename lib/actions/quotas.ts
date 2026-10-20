"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userHasPermission } from "@/lib/permissions-server";
import { currentQuotaPeriods } from "@/lib/quotaPeriods";
import type { QuotaPeriodId } from "@/lib/types";

export type SetQuotaResult = { error?: string; success?: boolean };

const PERIOD_IDS: QuotaPeriodId[] = ["weekly", "monthly", "quarterly"];

/** Sets one agent's quota (in PHP) for the *current* weekly/monthly/quarterly cycle. */
export async function setAgentQuotaAction(
  agentId: string,
  periodId: QuotaPeriodId,
  amount: number
): Promise<SetQuotaResult> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };
  const allowed =
    session.user.role === "ADMINISTRATOR" ||
    (await userHasPermission(session.user.id, session.user.role, "SET_AGENT_QUOTAS"));
  if (!allowed) return { error: "Not authorized." };

  if (!PERIOD_IDS.includes(periodId)) return { error: "Unknown period." };
  if (!Number.isFinite(amount) || amount < 0 || amount > 100_000_000_000) {
    return { error: "Enter a valid quota amount." };
  }

  const agent = await prisma.user.findUnique({ where: { id: agentId }, select: { id: true, name: true } });
  if (!agent) return { error: "Agent not found." };

  const period = currentQuotaPeriods().find((p) => p.id === periodId)!;
  const dbPeriod = periodId.toUpperCase() as "WEEKLY" | "MONTHLY" | "QUARTERLY";
  const start = new Date(`${period.start}T00:00:00.000Z`);

  // The cycle's row is created the first time anyone sets a quota for it.
  const existing = await prisma.quotaPeriod.findFirst({ where: { periodId: dbPeriod, start }, select: { id: true } });
  const quotaPeriodId =
    existing?.id ??
    (
      await prisma.quotaPeriod.create({
        data: {
          periodId: dbPeriod,
          label: period.label,
          cycleLabel: period.cycleLabel,
          start,
          end: new Date(`${period.end}T00:00:00.000Z`),
          asOf: new Date(`${period.asOf}T00:00:00.000Z`),
        },
        select: { id: true },
      })
    ).id;

  await prisma.agentQuota.upsert({
    where: { agentId_quotaPeriodId: { agentId, quotaPeriodId } },
    update: { quotaAmount: amount },
    create: { agentId, quotaPeriodId, quotaAmount: amount },
  });

  await prisma.activityLogEntry.create({
    data: {
      userId: session.user.id,
      userLabel: session.user.name ?? session.user.email ?? "Unknown",
      action: `Set ${period.label.toLowerCase()} quota for ${agent.name}`,
      module: "Leaderboard",
    },
  });

  revalidatePath("/portal/leaderboard");
  return { success: true };
}
