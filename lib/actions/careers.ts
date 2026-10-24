"use server";

import { revalidatePath } from "next/cache";
import { JobApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { createNotification } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rateLimit";
import { checkBot } from "@/lib/botGuard";
import { tooLong, type BotSignals } from "@/lib/botSignals";
import { inquiriesClosedMessage } from "@/lib/system-settings";

export type JobApplicationInput = {
  name: string;
  email: string;
  expertise: string;
  portfolio?: string;
  bot?: BotSignals;
};

export type JobApplicationResult = { error?: string };

/** Public-facing: submits a careers application. Anyone may call this — no auth required. */
export async function createJobApplicationAction(values: JobApplicationInput): Promise<JobApplicationResult> {
  const closed = await inquiriesClosedMessage();
  if (closed) return { error: closed };

  const rateLimit = await checkRateLimit("publicForm");
  if (!rateLimit.allowed) {
    return { error: `Too many submissions — please try again in ${rateLimit.retryAfterSeconds}s.` };
  }

  const bot = await checkBot(values.bot);
  if (!bot.ok) return bot.silent ? {} : { error: bot.error };

  if (tooLong({ name: values.name, email: values.email, expertise: values.expertise, portfolio: values.portfolio })) {
    return { error: "One of the fields is too long." };
  }

  const name = values.name?.trim();
  const email = values.email?.trim();
  const expertise = values.expertise?.trim();

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };
  if (!expertise) return { error: "Select an area of expertise." };

  await prisma.jobApplication.create({
    data: {
      name,
      email,
      positionInterest: expertise,
      portfolioUrl: values.portfolio?.trim() || null,
    },
  });

  await createNotification({
    type: "NEW_APPLICATION",
    title: "New job application",
    body: `${name} applied for ${expertise}`,
    link: "/portal/careers",
  });

  revalidatePath("/portal/careers");
  return {};
}

export type JobApplicationRow = {
  id: string;
  name: string;
  email: string;
  positionInterest: string;
  portfolioUrl: string | null;
  status: JobApplicationStatus;
  appliedAt: string;
};

/** Admin-only: lists every job application, newest first. */
export async function listJobApplications(): Promise<JobApplicationRow[]> {
  await requireAdmin();
  const rows = await prisma.jobApplication.findMany({ orderBy: { appliedAt: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    positionInterest: r.positionInterest,
    portfolioUrl: r.portfolioUrl,
    status: r.status,
    appliedAt: r.appliedAt.toISOString(),
  }));
}

/** Admin-only: updates an applicant's status. */
export async function updateJobApplicationStatusAction(
  id: string,
  status: JobApplicationStatus
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  await prisma.jobApplication.update({ where: { id }, data: { status } });
  revalidatePath("/portal/careers");
  return { success: true };
}
