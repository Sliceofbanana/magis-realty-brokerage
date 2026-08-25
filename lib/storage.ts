import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

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

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);

export type UploadedFile = {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
  resourceType: "image" | "raw";
};

/** Uploads a browser `File` (from a Server Action's FormData) to Cloudinary under `magis-realty/<folder>`. */
export async function uploadFile(file: File, folder: string): Promise<UploadedFile> {
  ensureConfigured();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const resourceType: "image" | "raw" = IMAGE_EXTENSIONS.has(ext) ? "image" : "raw";
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;

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
