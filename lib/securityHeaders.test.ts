import { describe, expect, it } from "vitest";
import { buildSecurityHeaders } from "@/lib/securityHeaders";

const get = (headers: ReturnType<typeof buildSecurityHeaders>, key: string) =>
  headers.find((h) => h.key === key)?.value;

describe("buildSecurityHeaders", () => {
  const prod = buildSecurityHeaders(true);
  const dev = buildSecurityHeaders(false);

  it("forbids framing, plugins, <base> injection and foreign form targets", () => {
    const csp = get(prod, "Content-Security-Policy")!;
    for (const d of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) {
      expect(csp).toContain(d);
    }
    expect(get(prod, "X-Frame-Options")).toBe("DENY");
  });

  it("allows the third parties the site actually uses", () => {
    const csp = get(prod, "Content-Security-Policy")!;
    expect(csp).toMatch(/script-src[^;]*challenges\.cloudflare\.com/);
    expect(csp).toMatch(/frame-src[^;]*www\.google\.com/);
    expect(csp).toMatch(/img-src[^;]*res\.cloudinary\.com/);
  });

  it("does not allow eval or wildcard script sources in production", () => {
    const script = get(prod, "Content-Security-Policy")!.match(/script-src[^;]*/)![0];
    expect(script).not.toContain("unsafe-eval");
    expect(script).not.toMatch(/\s\*|https:(\s|$)/);
  });

  it("only relaxes eval and websockets in development", () => {
    expect(get(dev, "Content-Security-Policy")).toContain("'unsafe-eval'");
    expect(get(dev, "Content-Security-Policy")).toContain("ws:");
    expect(get(prod, "Content-Security-Policy")).not.toContain("ws:");
  });

  it("sends HSTS and upgrade-insecure-requests only in production", () => {
    expect(get(prod, "Strict-Transport-Security")).toMatch(/max-age=\d+/);
    expect(get(prod, "Content-Security-Policy")).toContain("upgrade-insecure-requests");
    expect(get(dev, "Strict-Transport-Security")).toBeUndefined();
    expect(get(dev, "Content-Security-Policy")).not.toContain("upgrade-insecure-requests");
  });
});
