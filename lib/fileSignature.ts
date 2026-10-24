/**
 * Identifies an uploaded file by what is actually inside it, not by the name
 * or Content-Type the browser sent — both of those are chosen by the uploader.
 * Pure (no Node-only APIs beyond Buffer), so it is unit-tested directly.
 */

export type FileKind = "jpg" | "png" | "webp" | "pdf" | "docx" | "xlsx";

/** The MIME type each kind is stored and served as. */
export const MIME_BY_KIND: Record<FileKind, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const IMAGE_KINDS: readonly FileKind[] = ["jpg", "png", "webp"];

/** Maps a filename extension to the kind it claims to be. */
export function kindFromExtension(ext: string): FileKind | null {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "jpg";
    case "png":
      return "png";
    case "webp":
      return "webp";
    case "pdf":
      return "pdf";
    case "docx":
      return "docx";
    case "xlsx":
      return "xlsx";
    default:
      return null;
  }
}

const startsWith = (buf: Buffer, bytes: number[], offset = 0) =>
  buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b);

/** The kind the file's bytes say it is, or null if it isn't one we accept. */
export function detectFileKind(buf: Buffer): FileKind | null {
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return "jpg";
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  // RIFF....WEBP
  if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)) return "webp";
  // The PDF header may be preceded by a little junk, but must appear early.
  if (buf.subarray(0, 1024).includes("%PDF-")) return "pdf";
  // Office Open XML files are zip archives; the part names tell Word from Excel.
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04])) {
    if (buf.includes("word/document.xml")) return "docx";
    if (buf.includes("xl/workbook.xml")) return "xlsx";
  }
  return null;
}
