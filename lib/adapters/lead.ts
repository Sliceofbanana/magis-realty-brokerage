import type { Prisma } from "@prisma/client";
import type { Lead } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export const leadWithProperty = {
  property: { select: { title: true, price: true } },
} satisfies Prisma.LeadInclude;

type LeadWithProperty = Prisma.LeadGetPayload<{ include: typeof leadWithProperty }>;

export const leadStatusLabel: Record<string, Lead["status"]> = {
  NEW: "New",
  QUALIFIED: "Qualified",
  FOLLOW_UP: "Follow-up",
  CONTACTED: "Contacted",
};

export const leadStatusTone: Record<string, "blue" | "green" | "gold" | "gray"> = {
  NEW: "blue",
  QUALIFIED: "green",
  FOLLOW_UP: "gold",
  CONTACTED: "gray",
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
  };
}
