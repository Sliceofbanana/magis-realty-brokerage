import "server-only";
import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  /** Omit to broadcast to every Administrator. */
  recipientId?: string;
};

/**
 * Raises a notification. Internal helper for server code (leads, careers,
 * registration). It deliberately is not a Server Action: it takes the target
 * and link verbatim, so exposing it would let anyone push arbitrary
 * notifications — with arbitrary links — into administrators' inboxes.
 */
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
