"use server";

import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { checkBot } from "@/lib/botGuard";
import type { BotSignals } from "@/lib/botSignals";
import { inquiriesClosedMessage } from "@/lib/system-settings";

export type NewsletterResult = { error?: string; success?: boolean };

export async function subscribeToNewsletterAction(email: string, bot?: BotSignals): Promise<NewsletterResult> {
  const closed = await inquiriesClosedMessage();
  if (closed) return { error: closed };

  const rateLimit = await checkRateLimit("publicForm");
  if (!rateLimit.allowed) {
    return { error: `Too many submissions — please try again in ${rateLimit.retryAfterSeconds}s.` };
  }

  const check = await checkBot(bot);
  if (!check.ok) return check.silent ? { success: true } : { error: check.error };

  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 200 || !isValidEmail(trimmed)) return { error: "Enter a valid email address." };

  await prisma.newsletterSubscriber.upsert({
    where: { email: trimmed },
    create: { email: trimmed },
    update: {},
  });

  return { success: true };
}
