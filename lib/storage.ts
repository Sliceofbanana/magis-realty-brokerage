import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { IMAGE_KINDS, MIME_BY_KIND, detectFileKind, kindFromExtension, type FileKind } from "@/lib/fileSignature";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export type UploadedFile = {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
  resourceType: "image" | "raw";
};

/** The upload isn't a file we accept; `message` is safe to show the uploader. */
export class InvalidFileError extends Error {}

/**
 * Checks a browser `File` really is one of `allowed`: its extension must name
 * an allowed kind AND its bytes must be that same kind. The Content-Type the
 * browser sent is ignored — the uploader controls it. Returns the kind and
 * contents so the caller doesn't read the file twice.
 */
export async function inspectUpload(file: File, allowed: readonly FileKind[]): Promise<{ kind: FileKind; buffer: Buffer }> {
  const claimed = kindFromExtension(file.name.split(".").pop() ?? "");
  if (!claimed || !allowed.includes(claimed)) {
    throw new InvalidFileError("Unsupported file type.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  if (detectFileKind(buffer) !== claimed) {
    throw new InvalidFileError("That file doesn't look like a real " + claimed.toUpperCase() + " — it may be damaged or renamed.");
  }
  return { kind: claimed, buffer };
}

/**
 * Validates (see inspectUpload) and uploads a browser `File` to Cloudinary under
 * `magis-realty/<folder>`. The file is sent with the MIME type its contents
 * prove, never the one the browser claimed. Throws InvalidFileError for a file
 * that isn't an allowed type.
 */
export async function uploadFile(file: File, folder: string, allowed: readonly FileKind[]): Promise<UploadedFile> {
  const { kind, buffer } = await inspectUpload(file, allowed);
  ensureConfigured();
  const resourceType: "image" | "raw" = IMAGE_KINDS.includes(kind) ? "image" : "raw";
  const dataUri = `data:${MIME_BY_KIND[kind]};base64,${buffer.toString("base64")}`;

  const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
    folder: `magis-realty/${folder}`,
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    format: result.format,
    resourceType,
  };
}

/** Deletes a previously uploaded asset. `resourceType` must match what it was uploaded as. */
export async function deleteFile(publicId: string, resourceType: "image" | "raw"): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/** True when all three Cloudinary credentials are set (says nothing about whether they work). */
export function storageConfigured(): boolean {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

/** Round-trips to Cloudinary with the configured credentials; rejects if they're wrong or it's unreachable. */
export async function pingStorage(): Promise<void> {
  ensureConfigured();
  await cloudinary.api.ping();
}

export type StorageUsage = {
  plan: string | null;
  /** Bytes stored. */
  storageBytes: number | null;
  /** Share of the plan's credits used so far this cycle, 0–100. */
  creditsUsedPercent: number | null;
};

/** Reads the account's usage from Cloudinary's Admin API. Fields it doesn't return come back null. */
export async function getStorageUsage(): Promise<StorageUsage> {
  ensureConfigured();
  const usage = await cloudinary.api.usage();
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  return {
    plan: typeof usage?.plan === "string" ? usage.plan : null,
    storageBytes: num(usage?.storage?.usage),
    creditsUsedPercent: num(usage?.credits?.used_percent),
  };
}
