"use server";

import { revalidatePath } from "next/cache";
import { LeadPriority, LeadStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/actions/notifications";
import { requireAdmin } from "@/lib/actions/users";
import { checkRateLimit } from "@/lib/rateLimit";

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

/** Inquiries about a property at/above this price are treated as higher-value (roughly the top of today's catalog). */
const HIGH_VALUE_PROPERTY_PRICE = 5_000_000;

/**
 * Infers a starting priority for a public inquiry — admins can always
 * override it on the Kanban board, this just gives the pipeline a sane
 * default instead of dumping everything into Medium:
 *  - High: tied to a specific property priced at/above the luxury threshold.
 *  - Low: no phone number AND no message — the thinnest, least actionable submissions.
 *  - Medium: everything else (the common case).
 */
async function inferPriority(input: InquiryInput): Promise<LeadPriority> {
  if (input.propertyId) {
    const property = await prisma.property.findUnique({
      where: { id: input.propertyId },
      select: { price: true },
    });
    if (property && Number(property.price) >= HIGH_VALUE_PROPERTY_PRICE) {
      return LeadPriority.HIGH;
    }
  }
  if (!input.phone?.trim() && !input.message?.trim()) {
    return LeadPriority.LOW;
  }
  return LeadPriority.MEDIUM;
}

/** Public lead-capture entry point — used by every inquiry form on the site. */
export async function submitInquiryAction(input: InquiryInput): Promise<InquiryResult> {
  const rateLimit = await checkRateLimit("publicForm");
  if (!rateLimit.allowed) {
    return { error: `Too many submissions — please try again in ${rateLimit.retryAfterSeconds}s.` };
  }

  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();

  if (!name || !email) {
    return { error: "Name and email are required." };
  }
  if (!emailPattern.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const priority = await inferPriority(input);

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
      priority,
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

  if (input.agentId) {
    await createNotification({
      type: "NEW_LEAD",
      title: "New lead for you",
      body: `${name} requested a consultation with you${input.propertyLabel ? ` about ${input.propertyLabel}` : ""}.`,
      link: "/portal/leads",
      recipientId: input.agentId,
    });
  }

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

export type AssignLeadResult = { error?: string; success?: boolean };

/** Admin-only: assigns (or clears, with agentId null) a lead's agent — notifies the newly assigned agent. */
export async function assignLeadAction(leadId: string, agentId: string | null): Promise<AssignLeadResult> {
  await requireAdmin();

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { agentId },
    select: { name: true, propertyLabel: true, property: { select: { title: true } } },
  });

  if (agentId) {
    const propertyLabel = lead.property?.title ?? lead.propertyLabel;
    await createNotification({
      type: "NEW_LEAD",
      title: "Lead assigned to you",
      body: `${lead.name} was assigned to you${propertyLabel ? ` — ${propertyLabel}` : ""}.`,
      link: "/portal/leads",
      recipientId: agentId,
    });
  }

  revalidatePath("/portal/leads");
  return { success: true };
}

export type UpdateLeadStatusResult = { error?: string; success?: boolean };

/** Admin-only: moves a lead to a new status (drag-and-drop between Kanban columns). */
export async function updateLeadStatusAction(
  leadId: string,
  status: LeadStatus
): Promise<UpdateLeadStatusResult> {
  await requireAdmin();

  if (!(status in LeadStatus)) return { error: "Invalid status." };

  await prisma.lead.update({ where: { id: leadId }, data: { status } });

  revalidatePath("/portal/leads");
  return { success: true };
}
