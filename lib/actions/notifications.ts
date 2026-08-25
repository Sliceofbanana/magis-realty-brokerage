"use server";

import { revalidatePath } from "next/cache";
import { NotificationType } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  /** Omit to broadcast to every Administrator. */
  recipientId?: string;
};

/** Internal helper — called from other Server Actions (leads, careers, registration) to raise a notification. */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  await prisma.notification.create({
    data: {
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      recipientId: input.recipientId,
    },
  });
}

export type NotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

/** Returns the current admin's notifications: broadcast (recipientId null) plus anything addressed to them. */
export async function listMyNotifications(): Promise<NotificationRow[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMINISTRATOR") return [];

  const rows = await prisma.notification.findMany({
    where: { OR: [{ recipientId: null }, { recipientId: session.user.id }] },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    link: r.link,
    read: r.read,
    createdAt: r.createdAt.toISOString(),
  }));
}

/** Marks one notification read. */
export async function markNotificationReadAction(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/portal");
}

/** Marks every notification visible to the current admin as read. */
export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMINISTRATOR") return;
  await prisma.notification.updateMany({
    where: { OR: [{ recipientId: null }, { recipientId: session.user.id }] },
    data: { read: true },
  });
  revalidatePath("/portal");
}
