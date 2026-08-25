"use server";

import { revalidatePath } from "next/cache";
import { JobApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/users";
import { createNotification } from "@/lib/actions/notifications";

export type JobApplicationInput = {
  name: string;
  email: string;
  expertise: string;
  portfolio?: string;
};

export type JobApplicationResult = { error?: string };

/** Public-facing: submits a careers application. Anyone may call this — no auth required. */
export async function createJobApplicationAction(values: JobApplicationInput): Promise<JobApplicationResult> {
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
