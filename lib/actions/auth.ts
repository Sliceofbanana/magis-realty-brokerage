"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/auth";
import { createNotification } from "@/lib/actions/notifications";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createToken, consumeToken } from "@/lib/tokens";
import { sendEmail, verifyEmailTemplate, passwordResetTemplate, loginAlertTemplate } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";

export type ActionState = { error?: string; success?: boolean } | null;

// Anyone whose account predates this cutoff is grandfathered past the
// "verify your email" login gate below — email verification didn't exist
// before this feature shipped, so there's no verification link they could
// ever have clicked. Only registrations from this point on are held to it.
const EMAIL_VERIFICATION_LAUNCHED_AT = new Date("2026-09-01T00:00:00Z");

/**
 * Checks account status first (with a specific, user-facing message for
 * PENDING/DEACTIVATED/REJECTED) before ever calling next-auth's signIn —
 * auth.ts's authorize() still fails closed on its own as a defensive
 * second check, but this is what actually surfaces the reason to the user.
 */
export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const rateLimit = await checkRateLimit("login");
  if (!rateLimit.allowed) {
    return { error: `Too many attempts — please try again in ${rateLimit.retryAfterSeconds}s.` };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password to continue." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  if (!user.emailVerified && user.createdAt >= EMAIL_VERIFICATION_LAUNCHED_AT) {
    return { error: "Please verify your email address first — check your inbox for the verification link." };
  }

  if (user.status === "PENDING") {
    return { error: "Your application is still pending admin approval. We'll notify you once it's reviewed." };
  }
  if (user.status === "DEACTIVATED") {
    return { error: "This account has been deactivated. Contact an administrator." };
  }
  if (user.status === "REJECTED") {
    return { error: "This registration was not approved. Contact an administrator for details." };
  }

  const result = await signIn("credentials", { email, password, redirect: false }).catch(() => null);
  if (!result || (typeof result === "object" && "error" in result && result.error)) {
    return { error: "Invalid email or password." };
  }

  // Scheduled after the response is sent — doesn't add latency to the
  // sign-in redirect, and (unlike a plain un-awaited promise) is guaranteed
  // to actually finish running on platforms like Vercel.
  const ip = await getClientIp();
  const when = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" });
  after(() =>
    sendEmail({
      to: user.email,
      subject: "New sign-in to your Magis Realty account",
      html: loginAlertTemplate(user.name, `${when} (PHT)`, ip),
    })
  );

  redirect("/portal");
}

/** Demo-only shortcut (dev builds): signs straight into the seeded "Agent Smith" account. */
export async function demoLoginAction(): Promise<ActionState> {
  const result = await signIn("credentials", {
    email: "agent.smith@magisrealty.com",
    password: "Password123!",
    redirect: false,
  }).catch(() => null);

  if (!result || (typeof result === "object" && "error" in result && result.error)) {
    return { error: "Demo account is unavailable — has the database been seeded?" };
  }

  redirect("/portal");
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}

/** Odoo-style registration gate: new agents land in PENDING, no session issued. */
export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const rateLimit = await checkRateLimit("register");
  if (!rateLimit.allowed) {
    return { error: `Too many attempts — please try again in ${rateLimit.retryAfterSeconds}s.` };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Fill in your name, email, and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || undefined,
      passwordHash: await hashPassword(password),
      role: "AGENT",
      status: "PENDING",
    },
  });

  await createNotification({
    type: "NEW_REGISTRATION",
    title: "New registration request",
    body: `${name} requested an agent account and is awaiting approval`,
    link: "/portal/users",
  });

  const token = await createToken("email-verify", email, 24 * 60 * 60 * 1000);
  const baseUrl = await getBaseUrl();
  await sendEmail({
    to: email,
    subject: "Verify your email — Magis Realty & Brokerage",
    html: verifyEmailTemplate(name, `${baseUrl}/verify-email?token=${token}`),
  });

  redirect("/register/success");
}

/** Re-sends the email-verification link, e.g. if the first one expired or was lost. Same generic response either way — no confirming which emails exist in the system. */
export async function resendVerificationEmailAction(email: string): Promise<ActionState> {
  const rateLimit = await checkRateLimit("passwordReset");
  if (!rateLimit.allowed) {
    return { error: `Too many attempts — please try again in ${rateLimit.retryAfterSeconds}s.` };
  }

  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (user && !user.emailVerified) {
    const token = await createToken("email-verify", normalized, 24 * 60 * 60 * 1000);
    const baseUrl = await getBaseUrl();
    await sendEmail({
      to: normalized,
      subject: "Verify your email — Magis Realty & Brokerage",
      html: verifyEmailTemplate(user.name, `${baseUrl}/verify-email?token=${token}`),
    });
  }

  return { success: true };
}

/** Public entry point for the /verify-email page — consumes the token and marks the account verified. */
export async function verifyEmailAction(token: string): Promise<{ error?: string; success?: boolean }> {
  const result = await consumeToken("email-verify", token);
  if (!result) {
    return { error: "This verification link is invalid or has expired." };
  }

  await prisma.user.update({
    where: { email: result.email },
    data: { emailVerified: new Date() },
  });

  return { success: true };
}

/** Always returns a generic success response, whether or not the email exists — avoids leaking which addresses are registered. */
export async function requestPasswordResetAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const rateLimit = await checkRateLimit("passwordReset");
  if (!rateLimit.allowed) {
    return { error: `Too many attempts — please try again in ${rateLimit.retryAfterSeconds}s.` };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "Enter your email address." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = await createToken("password-reset", email, 60 * 60 * 1000);
    const baseUrl = await getBaseUrl();
    await sendEmail({
      to: email,
      subject: "Reset your password — Magis Realty & Brokerage",
      html: passwordResetTemplate(user.name, `${baseUrl}/reset-password?token=${token}`),
    });
  }

  return { success: true };
}

export type ResetPasswordState = { error?: string; success?: boolean } | null;

/** Consumes a password-reset token and sets the new password. */
export async function resetPasswordAction(
  token: string,
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const result = await consumeToken("password-reset", token);
  if (!result) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  await prisma.user.update({
    where: { email: result.email },
    data: { passwordHash: await hashPassword(password) },
  });

  return { success: true };
}
