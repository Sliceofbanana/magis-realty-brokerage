import { headers } from "next/headers";

/** Absolute origin for the current request — needed to build links (e.g. QR codes) that work when opened on a different device. */
export async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
