import type { Prisma } from "@prisma/client";
import type { DocumentFile as DocumentFileDTO } from "@/lib/types";

export const documentWithRelations = {
  uploadedBy: { select: { id: true, name: true } },
  property: { select: { id: true, title: true } },
} satisfies Prisma.DocumentFileInclude;

type DocumentFileWithRelations = Prisma.DocumentFileGetPayload<{ include: typeof documentWithRelations }>;

const categoryLabel: Record<string, string> = {
  PERSONAL: "Personal Documents",
  PROPERTY: "Property Documents",
  CONTRACT_TEMPLATE: "Contract Templates",
  ARCHIVE: "Archive",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

/** Maps a Prisma DocumentFile row (+ relations) to the frontend DocumentFile shape. */
export function toDocumentFile(d: DocumentFileWithRelations): DocumentFileDTO {
  return {
    id: d.id,
    name: d.name,
    category: categoryLabel[d.category] ?? d.category,
    categoryKey: d.category,
    type: d.type,
    size: formatBytes(d.sizeBytes),
    date: d.uploadedAt.toISOString().slice(0, 10),
    url: d.url,
    uploadedById: d.uploadedById,
    uploadedByName: d.uploadedBy.name,
    propertyId: d.propertyId,
    propertyTitle: d.property?.title ?? null,
  };
}
