"use server";

import { revalidatePath } from "next/cache";
import { PropertyStatus, PropertyType } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";

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
  const image = String(formData.get("image") ?? "").trim();

  if (!title) return { error: "Title is required." };
  if (!(statusRaw in PropertyStatus)) return { error: "Select a status." };
  if (!(typeRaw in PropertyType)) return { error: "Select a property type." };
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

  if (image) {
    await prisma.propertyImage.create({
      data: { propertyId: property.id, url: image, isCover: true, sortOrder: 0 },
    });
  }

  revalidatePath("/portal/listings");
  revalidatePath("/properties");
  revalidatePath(`/properties/${property.slug}`);

  return { success: true };
}
