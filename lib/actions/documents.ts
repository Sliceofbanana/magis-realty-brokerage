"use server";

import { revalidatePath } from "next/cache";
import { DocumentCategory, DocumentType } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/storage";

export type DocumentActionResult = { error?: string; success?: boolean };

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB — mirrors next.config.ts's serverActions.bodySizeLimit
const EXT_TO_TYPE: Record<string, DocumentType> = {
  pdf: "PDF",
  docx: "DOCX",
  xlsx: "XLSX",
  jpg: "JPG",
  jpeg: "JPG",
  png: "PNG",
};

/** Uploads a file to Cloudinary and creates its DocumentFile row. Any authenticated user may call this. */
export async function createDocumentAction(
  _prevState: DocumentActionResult,
  formData: FormData
): Promise<DocumentActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > MAX_FILE_BYTES) return { error: "File is larger than 10MB." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const type = EXT_TO_TYPE[ext];
  if (!type) return { error: "Unsupported file type. Allowed: PDF, DOCX, XLSX, JPG, PNG." };

  const categoryRaw = String(formData.get("category") ?? "");
  if (!(categoryRaw in DocumentCategory)) return { error: "Select a folder." };
  const category = categoryRaw as DocumentCategory;

  const propertyIdRaw = String(formData.get("propertyId") ?? "").trim();
  if (category === "PROPERTY" && !propertyIdRaw) {
    return { error: "Select a property for a Property Document." };
  }
  if (propertyIdRaw) {
    const property = await prisma.property.findUnique({ where: { id: propertyIdRaw }, select: { id: true } });
    if (!property) return { error: "Selected property not found." };
  }

  let uploaded;
  try {
    uploaded = await uploadFile(file, category.toLowerCase());
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return { error: "Upload failed. Please check your connection and try again." };
  }

  await prisma.documentFile.create({
    data: {
      name: file.name,
      category,
      type,
      sizeBytes: uploaded.bytes,
      url: uploaded.url,
      cloudinaryPublicId: uploaded.publicId,
      cloudinaryResourceType: uploaded.resourceType,
      uploadedById: session.user.id,
      propertyId: propertyIdRaw || null,
    },
  });

  revalidatePath("/portal/documents");
  return { success: true };
}

/** Deletes a document — the uploader or an Administrator only. */
export async function deleteDocumentAction(id: string): Promise<DocumentActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const doc = await prisma.documentFile.findUnique({ where: { id } });
  if (!doc) return { error: "Document not found." };

  const isOwner = doc.uploadedById === session.user.id;
  const isAdmin = session.user.role === "ADMINISTRATOR";
  if (!isOwner && !isAdmin) return { error: "Not authorized." };

  try {
    await deleteFile(doc.cloudinaryPublicId, doc.cloudinaryResourceType as "image" | "raw");
  } catch (err) {
    // Log and proceed: don't leave the row stuck forever because Cloudinary
    // is unreachable — an orphaned Cloudinary asset can be cleaned up
    // manually, but an orphaned DB row with a dead link is worse UX.
    console.error("Cloudinary delete failed:", err);
  }

  await prisma.documentFile.delete({ where: { id } });
  revalidatePath("/portal/documents");
  return { success: true };
}

/** Form-action wrapper for deleteDocumentAction, for use with `.bind(null, id)` on a `<form action>`. */
export async function deleteDocumentFormAction(id: string, _formData: FormData): Promise<void> {
  await deleteDocumentAction(id);
}
