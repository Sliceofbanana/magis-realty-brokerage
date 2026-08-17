"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

export type MyProfile = {
  name: string;
  position: string | null;
  phone: string | null;
  email: string;
  photo: string | null;
};

/** Basic identity fields for the current session user — used by Settings > General. */
export async function getMyProfileAction(): Promise<MyProfile | null> {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, position: true, phone: true, email: true, photo: true },
  });
  return user;
}

export type ProfileUpdateInput = {
  name: string;
  position?: string;
  phone?: string;
  primaryOffice?: string;
  prcLicense?: string;
  dhsudRegistration?: string;
  languages?: string[];
  bio?: string;
  yearsExperience?: number;
  specialization?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
};

export type ProfileUpdateResult = { error?: string; success?: boolean };

/** Updates the current session user's own profile — no admin check, everyone edits their own. */
export async function updateProfileAction(values: ProfileUpdateInput): Promise<ProfileUpdateResult> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const name = values.name?.trim();
  if (!name) return { error: "Full name is required." };

  const existing = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agentProfile: true },
  });
  if (!existing) return { error: "User not found." };

  await prisma.user.update({
    where: { id: existing.id },
    data: {
      name,
      position: values.position?.trim() || null,
      phone: values.phone?.trim() || null,
      primaryOffice: values.primaryOffice?.trim() || null,
    },
  });

  if (existing.agentProfile) {
    const bioParagraphs = values.bio
      ? values.bio
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean)
      : [];

    await prisma.agentProfile.update({
      where: { id: existing.agentProfile.id },
      data: {
        prcLicense: values.prcLicense?.trim() || null,
        dhsudRegistration: values.dhsudRegistration?.trim() || null,
        languages: values.languages ?? [],
        bio: bioParagraphs,
        yearsExperience: values.yearsExperience ?? null,
        specialization: values.specialization?.trim() || null,
        linkedinUrl: values.linkedinUrl?.trim() || null,
        facebookUrl: values.facebookUrl?.trim() || null,
        instagramUrl: values.instagramUrl?.trim() || null,
      },
    });
  }

  revalidatePath("/portal/profile");
  if (existing.agentProfile?.slug) {
    revalidatePath(`/agents/${existing.agentProfile.slug}`);
  }

  return { success: true };
}

export type PasswordUpdateResult = { error?: string; success?: boolean };

/** Changes the current session user's own password after verifying the current one. */
export async function updatePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<PasswordUpdateResult> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  if (newPassword.length < 12) {
    return { error: "New password must be at least 12 characters." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });
  if (!user?.passwordHash) return { error: "User not found." };

  const matches = await verifyPassword(currentPassword, user.passwordHash);
  if (!matches) return { error: "Current password is incorrect." };

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
