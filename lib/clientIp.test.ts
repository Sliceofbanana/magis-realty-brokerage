import { describe, expect, it } from "vitest";
import { clientIpFromHeaders } from "@/lib/clientIp";

const headers = (h: Record<string, string>) => (name: string) => h[name] ?? null;

describe("clientIpFromHeaders", () => {
  it("ignores forwarding headers when no proxy is trusted", () => {
    expect(clientIpFromHeaders(headers({ "x-forwarded-for": "6.6.6.6", "x-real-ip": "6.6.6.6" }), {})).toBe("unknown");
  });

  it("takes the first X-Forwarded-For hop on Vercel", () => {
    expect(clientIpFromHeaders(headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }), { VERCEL: "1" })).toBe("203.0.113.9");
  });

  it("trusts the headers when the operator says a proxy sets them", () => {
    expect(clientIpFromHeaders(headers({ "x-forwarded-for": "198.51.100.4" }), { TRUST_PROXY: "1" })).toBe("198.51.100.4");
    expect(clientIpFromHeaders(headers({ "x-forwarded-for": "198.51.100.4" }), { TRUST_PROXY: "0" })).toBe("unknown");
  });

  it("falls back to X-Real-IP, then to unknown", () => {
    expect(clientIpFromHeaders(headers({ "x-real-ip": "192.0.2.1" }), { VERCEL: "1" })).toBe("192.0.2.1");
    expect(clientIpFromHeaders(headers({}), { VERCEL: "1" })).toBe("unknown");
  });
});
