"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/auth";
import { createNotification } from "@/lib/actions/notifications";

export type ActionState = { error?: string } | null;

/**
 * Checks account status first (with a specific, user-facing message for
 * PENDING/DEACTIVATED/REJECTED) before ever calling next-auth's signIn —
 * auth.ts's authorize() still fails closed on its own as a defensive
 * second check, but this is what actually surfaces the reason to the user.
 */
export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password to continue." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
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
    link: "/portal/settings",
  });

  redirect("/register/success");
}
