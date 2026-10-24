import { describe, expect, it } from "vitest";
import { MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH, validatePassword } from "@/lib/passwordPolicy";

describe("validatePassword", () => {
  it("rejects anything shorter than the minimum", () => {
    expect(validatePassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toMatch(/at least 12/);
    expect(validatePassword("")).not.toBeNull();
  });

  it("accepts the minimum and the maximum", () => {
    expect(validatePassword("a".repeat(MIN_PASSWORD_LENGTH))).toBeNull();
    expect(validatePassword("a".repeat(MAX_PASSWORD_BYTES))).toBeNull();
  });

  it("rejects more than bcrypt would actually read", () => {
    expect(validatePassword("a".repeat(MAX_PASSWORD_BYTES + 1))).toMatch(/too long/);
  });

  it("counts bytes, not characters, for the upper bound", () => {
    // 40 emoji = 40 characters (80 UTF-16 units) but 160 bytes.
    expect(validatePassword("😀".repeat(40))).toMatch(/too long/);
  });

  it("does not impose composition rules", () => {
    expect(validatePassword("alllowercaseletters")).toBeNull();
  });
});
