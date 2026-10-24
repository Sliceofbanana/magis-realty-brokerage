import { describe, expect, it } from "vitest";
import { needsEmailVerification } from "@/lib/emailVerification";

describe("needsEmailVerification", () => {
  it("requires verification for a recent unverified account", () => {
    expect(needsEmailVerification({ emailVerified: null, createdAt: new Date("2026-10-01") })).toBe(true);
  });

  it("grandfathers accounts created before verification existed", () => {
    expect(needsEmailVerification({ emailVerified: null, createdAt: new Date("2026-08-01") })).toBe(false);
  });

  it("passes verified accounts", () => {
    expect(needsEmailVerification({ emailVerified: new Date(), createdAt: new Date("2026-10-01") })).toBe(false);
  });
});
