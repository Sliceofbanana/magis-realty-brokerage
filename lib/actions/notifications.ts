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

const NOTIFICATION_RETENTION_DAYS = 7;

/**
 * Returns the current user's notifications: admins see the broadcast pool
 * (recipientId null) plus anything addressed to them; everyone else only
 * sees notifications addressed directly to them (e.g. an assigned lead).
 *
 * Filtered by age rather than a flat row count — a `take` cap alone could
 * push a notification out of view in under a week during a busy stretch
 * (a burst of new leads, say) even though it's still well within the
 * retention window everyone should be able to count on.
 */
export async function listMyNotifications(): Promise<NotificationRow[]> {
  const session = await auth();
  if (!session?.user) return [];

  const since = new Date(Date.now() - NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const isAdmin = session.user.role === "ADMINISTRATOR";
  const rows = await prisma.notification.findMany({
    where: {
      createdAt: { gte: since },
      ...(isAdmin ? { OR: [{ recipientId: null }, { recipientId: session.user.id }] } : { recipientId: session.user.id }),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
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

/** Marks one notification read — scoped to the caller so no one can flip read state on a notification that isn't theirs. */
export async function markNotificationReadAction(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const isAdmin = session.user.role === "ADMINISTRATOR";
  await prisma.notification.updateMany({
    where: {
      id,
      ...(isAdmin ? { OR: [{ recipientId: null }, { recipientId: session.user.id }] } : { recipientId: session.user.id }),
    },
    data: { read: true },
  });
  revalidatePath("/portal");
}

/** Marks every notification visible to the current user as read. */
export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const isAdmin = session.user.role === "ADMINISTRATOR";
  await prisma.notification.updateMany({
    where: isAdmin
      ? { OR: [{ recipientId: null }, { recipientId: session.user.id }] }
      : { recipientId: session.user.id },
    data: { read: true },
  });
  revalidatePath("/portal");
}
