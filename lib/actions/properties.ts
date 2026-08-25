"use server";

import { revalidatePath } from "next/cache";
import { PropertyStatus, PropertyType, CebuRegion } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { uploadFile } from "@/lib/storage";
import { commissionRecordInclude, toCommissionRecord } from "@/lib/adapters/commission";
import type { CommissionRecord } from "@/lib/types";

export type CreatePropertyResult = { error?: string; success?: boolean };

const ALLOWED_ROLES = ["ADMINISTRATOR", "BROKER", "AGENT"];

/** Creates a new property listing — Administrators, Brokers, and Agents only (matches manage-own-listings). */
export async function createPropertyAction(
  _prevState: CreatePropertyResult,
  formData: FormData
): Promise<CreatePropertyResult> {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return { error: "Not authorized." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const collection = String(formData.get("collection") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "");
  const typeRaw = String(formData.get("type") ?? "");
  const regionRaw = String(formData.get("region") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");
  const pricePerSqftRaw = String(formData.get("pricePerSqft") ?? "");
  const beds = Number(formData.get("beds") ?? 0) || 0;
  const baths = Number(formData.get("baths") ?? 0) || 0;
  const area = Number(formData.get("area") ?? 0) || 0;
  const parking = Number(formData.get("parking") ?? 0) || 0;
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const amenitiesRaw = String(formData.get("amenities") ?? "").trim();
  const agentId = String(formData.get("agentId") ?? "").trim();
  const image = formData.get("image");

  if (!title) return { error: "Title is required." };
  if (!(statusRaw in PropertyStatus)) return { error: "Select a status." };
  if (!(typeRaw in PropertyType)) return { error: "Select a property type." };
  if (!(regionRaw in CebuRegion)) return { error: "Select a region." };
  if (!location) return { error: "Location is required." };
  if (!address) return { error: "Address is required." };
  const price = Number(priceRaw);
  if (!priceRaw || Number.isNaN(price) || price <= 0) return { error: "Enter a valid price." };
  if (!area || area <= 0) return { error: "Enter a valid area." };
  if (!agentId) return { error: "Select an agent." };

  const agent = await prisma.user.findUnique({ where: { id: agentId }, select: { id: true } });
  if (!agent) return { error: "Selected agent not found." };

  const description = descriptionRaw
    ? descriptionRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    : [];
  const amenities = amenitiesRaw
    ? amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    try {
      const uploaded = await uploadFile(image, "properties");
      imageUrl = uploaded.url;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      return { error: "Cover photo upload failed. Please check your connection and try again." };
    }
  }

  const slug = await uniqueSlug(
    title,
    async (candidate) => (await prisma.property.count({ where: { slug: candidate } })) > 0
  );

  const property = await prisma.property.create({
    data: {
      slug,
      title,
      collection: collection || null,
      status: statusRaw as PropertyStatus,
      type: typeRaw as PropertyType,
      region: regionRaw as CebuRegion,
      location,
      address,
      price,
      pricePerSqft: pricePerSqftRaw ? Number(pricePerSqftRaw) : null,
      beds,
      baths,
      area,
      parking,
      description,
      amenities,
      agentId,
    },
  });

  if (imageUrl) {
    await prisma.propertyImage.create({
      data: { propertyId: property.id, url: imageUrl, isCover: true, sortOrder: 0 },
    });
  }

  revalidatePath("/portal/listings");
  revalidatePath("/properties");
  revalidatePath(`/properties/${property.slug}`);

  return { success: true };
}

/** Updates an existing property listing — Administrators, Brokers, and Agents only. */
export async function updatePropertyAction(
  id: string,
  _prevState: CreatePropertyResult,
  formData: FormData
): Promise<CreatePropertyResult> {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return { error: "Not authorized." };
  }

  const existing = await prisma.property.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!existing) return { error: "Listing not found." };

  const title = String(formData.get("title") ?? "").trim();
  const collection = String(formData.get("collection") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "");
  const typeRaw = String(formData.get("type") ?? "");
  const regionRaw = String(formData.get("region") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");
  const pricePerSqftRaw = String(formData.get("pricePerSqft") ?? "");
  const beds = Number(formData.get("beds") ?? 0) || 0;
  const baths = Number(formData.get("baths") ?? 0) || 0;
  const area = Number(formData.get("area") ?? 0) || 0;
  const parking = Number(formData.get("parking") ?? 0) || 0;
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const amenitiesRaw = String(formData.get("amenities") ?? "").trim();
  const agentId = String(formData.get("agentId") ?? "").trim();
  const image = formData.get("image");

  if (!title) return { error: "Title is required." };
  if (!(statusRaw in PropertyStatus)) return { error: "Select a status." };
  if (!(typeRaw in PropertyType)) return { error: "Select a property type." };
  if (!(regionRaw in CebuRegion)) return { error: "Select a region." };
  if (!location) return { error: "Location is required." };
  if (!address) return { error: "Address is required." };
  const price = Number(priceRaw);
  if (!priceRaw || Number.isNaN(price) || price <= 0) return { error: "Enter a valid price." };
  if (!area || area <= 0) return { error: "Enter a valid area." };
  if (!agentId) return { error: "Select an agent." };

  const agent = await prisma.user.findUnique({ where: { id: agentId }, select: { id: true } });
  if (!agent) return { error: "Selected agent not found." };

  const description = descriptionRaw
    ? descriptionRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    : [];
  const amenities = amenitiesRaw
    ? amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    try {
      const uploaded = await uploadFile(image, "properties");
      imageUrl = uploaded.url;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      return { error: "Cover photo upload failed. Please check your connection and try again." };
    }
  }

  await prisma.property.update({
    where: { id },
    data: {
      title,
      collection: collection || null,
      status: statusRaw as PropertyStatus,
      type: typeRaw as PropertyType,
      region: regionRaw as CebuRegion,
      location,
      address,
      price,
      pricePerSqft: pricePerSqftRaw ? Number(pricePerSqftRaw) : null,
      beds,
      baths,
      area,
      parking,
      description,
      amenities,
      agentId,
    },
  });

  if (imageUrl) {
    const existingCover = await prisma.propertyImage.findFirst({
      where: { propertyId: id, isCover: true },
    });
    if (existingCover) {
      await prisma.propertyImage.update({ where: { id: existingCover.id }, data: { url: imageUrl } });
    } else {
      await prisma.propertyImage.create({
        data: { propertyId: id, url: imageUrl, isCover: true, sortOrder: 0 },
      });
    }
  }

  revalidatePath("/portal/listings");
  revalidatePath("/properties");
  revalidatePath(`/properties/${existing.slug}`);

  return { success: true };
}

/** Looks up the commission record(s) linked to a sold property, for the Listings admin History panel. */
export async function getPropertyCommissionHistory(propertyId: string): Promise<CommissionRecord[]> {
  const session = await auth();
  if (!session?.user) return [];

  const records = await prisma.commissionRecord.findMany({
    where: { propertyId },
    include: commissionRecordInclude,
    orderBy: { closedDate: "desc" },
  });
  return records.map(toCommissionRecord);
}

/** Archives/unarchives a property listing — Administrators, Brokers, and Agents only. */
export async function archivePropertyAction(id: string, archived: boolean): Promise<CreatePropertyResult> {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return { error: "Not authorized." };
  }

  const property = await prisma.property.update({ where: { id }, data: { archived }, select: { slug: true } });

  revalidatePath("/portal/listings");
  revalidatePath("/properties");
  revalidatePath(`/properties/${property.slug}`);

  return { success: true };
}

/** Form-action wrapper for archivePropertyAction, for use with `.bind(null, id, archived)` on a `<form action>`. */
export async function archivePropertyFormAction(
  id: string,
  archived: boolean,
  _formData: FormData
): Promise<void> {
  await archivePropertyAction(id, archived);
}
