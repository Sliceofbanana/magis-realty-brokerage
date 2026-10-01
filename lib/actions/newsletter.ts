"use server";

import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/validation";

export type NewsletterResult = { error?: string; success?: boolean };

export async function subscribeToNewsletterAction(email: string): Promise<NewsletterResult> {
  const trimmed = email.trim().toLowerCase();
  if (!isValidEmail(trimmed)) return { error: "Enter a valid email address." };

  await prisma.newsletterSubscriber.upsert({
    where: { email: trimmed },
    create: { email: trimmed },
    update: {},
  });

  return { success: true };
}
