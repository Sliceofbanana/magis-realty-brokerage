"use server";

import { revalidatePath } from "next/cache";
import { LeadPriority, LeadStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/actions/notifications";

export type InquiryInput = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  /// Free-text segment, e.g. selected "Interest Area" — stored on Lead.type.
  interest?: string;
  propertyId?: string;
  /// Free-text fallback when the caller doesn't have a real Property row's
  /// id yet (e.g. a page still running on mock data).
  propertyLabel?: string;
  agentId?: string;
  source: string;
};

export type InquiryResult = { error?: string; success?: boolean };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public lead-capture entry point — used by every inquiry form on the site. */
export async function submitInquiryAction(input: InquiryInput): Promise<InquiryResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();

  if (!name || !email) {
    return { error: "Name and email are required." };
  }
  if (!emailPattern.test(email)) {
    return { error: "Enter a valid email address." };
  }

  await prisma.lead.create({
    data: {
      name,
      email,
      phone: input.phone?.trim() || "",
      message: input.message?.trim() || undefined,
      type: input.interest,
      propertyId: input.propertyId,
      propertyLabel: input.propertyLabel,
      agentId: input.agentId,
      source: input.source,
    },
  });

  await prisma.activityLogEntry.create({
    data: {
      userLabel: name,
      action: input.propertyLabel
        ? `New lead: ${name} inquired about ${input.propertyLabel}`
        : `New lead: ${name} submitted an inquiry via ${input.source}`,
      module: "Leads",
    },
  });

  await createNotification({
    type: "NEW_LEAD",
    title: "New lead",
    body: input.propertyLabel
      ? `${name} inquired about ${input.propertyLabel}`
      : `${name} submitted an inquiry via ${input.source}`,
    link: "/portal/leads",
  });

  revalidatePath("/portal");
  revalidatePath("/portal/leads");

  return { success: true };
}

export type CreateLeadResult = { error?: string; success?: boolean };

/** Admin-panel entry point for manually logging a lead (e.g. a phone inquiry). */
export async function createLeadAction(
  _prevState: CreateLeadResult,
  formData: FormData
): Promise<CreateLeadResult> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "NEW");
  const priorityRaw = String(formData.get("priority") ?? "MEDIUM");
  const message = String(formData.get("message") ?? "").trim();
  const propertyId = String(formData.get("propertyId") ?? "").trim();

  if (!name || !email) return { error: "Name and email are required." };
  if (!emailPattern.test(email)) return { error: "Enter a valid email address." };
  if (!(statusRaw in LeadStatus)) return { error: "Select a status." };
  if (!(priorityRaw in LeadPriority)) return { error: "Select a priority." };

  await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      type: type || undefined,
      status: statusRaw as LeadStatus,
      priority: priorityRaw as LeadPriority,
      message: message || undefined,
      propertyId: propertyId || undefined,
      source: "Manual Entry",
    },
  });

  await prisma.activityLogEntry.create({
    data: {
      userId: session.user.id,
      userLabel: session.user.name ?? session.user.email ?? "Unknown user",
      action: `Manually logged lead: ${name}`,
      module: "Leads",
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/leads");

  return { success: true };
}
