import type { Prisma } from "@prisma/client";
import { LeadStatus } from "@prisma/client";
import type { Lead } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export const leadWithProperty = {
  property: { select: { title: true, price: true } },
  agent: { select: { id: true, name: true, photo: true } },
} satisfies Prisma.LeadInclude;

type LeadWithProperty = Prisma.LeadGetPayload<{ include: typeof leadWithProperty }>;

export const leadStatusLabel: Record<string, Lead["status"]> = {
  NEW: "New",
  QUALIFIED: "Qualified",
  FOLLOW_UP: "Follow-up",
  CONTACTED: "Contacted",
  WON: "Won",
  LOST: "Lost",
  ARCHIVED: "Archived",
};

export const leadStatusTone: Record<string, "blue" | "green" | "gold" | "gray" | "red" | "outline"> = {
  NEW: "blue",
  QUALIFIED: "green",
  FOLLOW_UP: "gold",
  CONTACTED: "gray",
  WON: "green",
  LOST: "red",
  ARCHIVED: "outline",
};

/** Reverse of leadStatusLabel — lets the Kanban board translate a column's display label back to the Prisma enum for updateLeadStatusAction. */
export const leadStatusEnumKey: Record<Lead["status"], LeadStatus> = {
  New: LeadStatus.NEW,
  Qualified: LeadStatus.QUALIFIED,
  "Follow-up": LeadStatus.FOLLOW_UP,
  Contacted: LeadStatus.CONTACTED,
  Won: LeadStatus.WON,
  Lost: LeadStatus.LOST,
  Archived: LeadStatus.ARCHIVED,
};

export const leadPriorityLabel: Record<string, Lead["priority"]> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Maps a Prisma Lead row (+ property) to the admin UI's Lead shape. */
export function toLead(l: LeadWithProperty): Lead {
  return {
    id: l.id,
    name: l.name,
    initials: getInitials(l.name),
    type: l.type ?? "General Inquiry",
    email: l.email,
    phone: l.phone,
    property: l.property?.title ?? l.propertyLabel ?? "General Inquiry",
    price: l.property?.price ? formatCurrency(Number(l.property.price)) : "—",
    date: l.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: leadStatusLabel[l.status] ?? "New",
    priority: leadPriorityLabel[l.priority] ?? "Medium",
    agent: l.agent ? { id: l.agent.id, name: l.agent.name, photo: l.agent.photo } : null,
  };
}
