import { describe, expect, it } from "vitest";
import { configuredOrigin } from "@/lib/url";

describe("configuredOrigin", () => {
  it("prefers AUTH_URL, then NEXTAUTH_URL, and returns just the origin", () => {
    expect(configuredOrigin({ AUTH_URL: "https://a.example/path?x=1", NEXTAUTH_URL: "https://b.example" })).toBe("https://a.example");
    expect(configuredOrigin({ NEXTAUTH_URL: "https://b.example/" })).toBe("https://b.example");
  });

  it("uses Vercel's production URL only in production", () => {
    expect(configuredOrigin({ NODE_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "magis.example" })).toBe("https://magis.example");
    expect(configuredOrigin({ NODE_ENV: "development", VERCEL_PROJECT_PRODUCTION_URL: "magis.example" })).toBeNull();
  });

  it("returns null when nothing usable is configured", () => {
    expect(configuredOrigin({})).toBeNull();
    expect(configuredOrigin({ NEXTAUTH_URL: "not a url" })).toBeNull();
  });

  it("rejects non-http(s) schemes", () => {
    expect(configuredOrigin({ NEXTAUTH_URL: "javascript:alert(1)" })).toBeNull();
    expect(configuredOrigin({ NEXTAUTH_URL: "ftp://x.example" })).toBeNull();
  });
});
