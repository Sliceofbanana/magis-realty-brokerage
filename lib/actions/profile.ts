"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { uploadFile } from "@/lib/storage";

export type MyProfile = {
  name: string;
  position: string | null;
  phone: string | null;
  email: string;
  photo: string | null;
  birthDate: string | null; // YYYY-MM-DD
  /** Public-profile fields (shown on the agent's page if an administrator lists them). */
  bio: string; // paragraphs separated by a blank line
  specialization: string | null;
  yearsExperience: number | null;
  /** Read-only here — only administrators can list an agent on the public site. */
  publicListed: boolean;
};

/** Identity + public-profile fields for the current session user — used by Settings > General. */
export async function getMyProfileAction(): Promise<MyProfile | null> {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      position: true,
      phone: true,
      email: true,
      photo: true,
      birthDate: true,
      agentProfile: { select: { bio: true, specialization: true, yearsExperience: true, publicListed: true } },
    },
  });
  if (!user) return null;

  const { agentProfile, ...rest } = user;
  return {
    ...rest,
    birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : null,
    bio: agentProfile?.bio.join("\n\n") ?? "",
    specialization: agentProfile?.specialization ?? null,
    yearsExperience: agentProfile?.yearsExperience ?? null,
    publicListed: agentProfile?.publicListed ?? false,
  };
}

export type ProfileUpdateInput = {
  name: string;
  position?: string;
  phone?: string;
  birthDate?: string | null; // YYYY-MM-DD, or null/"" to clear
  primaryOffice?: string;
  prcLicense?: string;
  dhsudRegistration?: string;
  languages?: string[];
  bio?: string;
  yearsExperience?: number | null;
  specialization?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
};

export type ProfileUpdateResult = { error?: string; success?: boolean };

async function uniqueAgentSlug(name: string) {
  const base =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "agent";
  let slug = base;
  for (let n = 2; await prisma.agentProfile.findUnique({ where: { slug }, select: { id: true } }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}

/** Updates the current session user's own profile — no admin check, everyone edits their own. */
export async function updateProfileAction(values: ProfileUpdateInput): Promise<ProfileUpdateResult> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const name = values.name?.trim();
  if (!name) return { error: "Full name is required." };

  // undefined = leave untouched, "" / null = clear, otherwise parse as a date.
  let birthDate: Date | null | undefined;
  if (values.birthDate !== undefined) {
    if (!values.birthDate) {
      birthDate = null;
    } else {
      const parsed = new Date(`${values.birthDate}T00:00:00.000Z`);
      if (Number.isNaN(parsed.getTime())) return { error: "Invalid birthday." };
      if (parsed.getTime() > Date.now()) return { error: "Birthday can't be in the future." };
      birthDate = parsed;
    }
  }

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
      ...(birthDate !== undefined ? { birthDate } : {}),
    },
  });

  // Same rule as birthDate: a field left undefined is untouched, so a save
  // that only sends name/phone (e.g. Settings > Profile Information) can't
  // wipe the agent's public bio or experience.
  const trimmedOrNull = (v: string | undefined) => (v === undefined ? undefined : v.trim() || null);
  const agentData = {
    prcLicense: trimmedOrNull(values.prcLicense),
    dhsudRegistration: trimmedOrNull(values.dhsudRegistration),
    languages: values.languages,
    bio:
      values.bio === undefined
        ? undefined
        : values.bio
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean),
    yearsExperience: values.yearsExperience,
    specialization: trimmedOrNull(values.specialization),
    linkedinUrl: trimmedOrNull(values.linkedinUrl),
    facebookUrl: trimmedOrNull(values.facebookUrl),
    instagramUrl: trimmedOrNull(values.instagramUrl),
  };
  const hasAgentChanges = Object.values(agentData).some((v) => v !== undefined);

  if (existing.agentProfile) {
    if (hasAgentChanges) {
      await prisma.agentProfile.update({ where: { id: existing.agentProfile.id }, data: agentData });
    }
  } else if (
    // Don't create an empty record just because someone saved Settings.
    (agentData.bio?.length ?? 0) > 0 ||
    agentData.specialization ||
    (agentData.yearsExperience ?? null) !== null
  ) {
    // Self-registered accounts start with no public profile record; create
    // it the first time they fill one in. It stays hidden (publicListed
    // defaults to false) until an administrator lists it.
    await prisma.agentProfile.create({
      data: { ...agentData, userId: existing.id, slug: await uniqueAgentSlug(name) },
    });
  }

  revalidatePath("/portal/profile");
  if (existing.agentProfile?.slug) {
    revalidatePath(`/agents/${existing.agentProfile.slug}`);
  }

  return { success: true };
}

export type PhotoUpdateResult = { error?: string; success?: boolean; photo?: string };

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB — plenty for a profile photo, well under the 10MB serverActions body limit
const PHOTO_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);

/**
 * Uploads and sets the current session user's own profile photo. `User.photo`
 * is the single source of truth every avatar in the app reads from (portal
 * topbar, sidebar, the public agent profile page), so this one write shows
 * up everywhere immediately — no per-surface wiring needed.
 */
export async function updateProfilePhotoAction(
  _prevState: PhotoUpdateResult | null,
  formData: FormData
): Promise<PhotoUpdateResult> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image to upload." };
  if (file.size > MAX_PHOTO_BYTES) return { error: "Image is larger than 5MB." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!PHOTO_EXTENSIONS.has(ext)) return { error: "Unsupported file type. Use JPG or PNG." };

  let uploaded;
  try {
    uploaded = await uploadFile(file, "avatars");
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return { error: "Upload failed. Please check your connection and try again." };
  }

  const existing = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { photo: true, agentProfile: { select: { slug: true } } },
  });

  await prisma.user.update({ where: { id: session.user.id }, data: { photo: uploaded.url } });

  revalidatePath("/portal/settings");
  revalidatePath("/portal");
  if (existing?.agentProfile?.slug) {
    revalidatePath(`/agents/${existing.agentProfile.slug}`);
  }

  return { success: true, photo: uploaded.url };
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
