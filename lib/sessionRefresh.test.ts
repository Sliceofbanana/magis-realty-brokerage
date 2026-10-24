import { describe, expect, it } from "vitest";
import type { JWT } from "next-auth/jwt";
import { applyAccountState } from "@/lib/sessionRefresh";

const staleToken = (): JWT => ({
  id: "u1",
  role: "ADMINISTRATOR",
  status: "ACTIVE",
  photo: null,
  isSystemAdmin: true,
});

describe("applyAccountState", () => {
  it("ends the session when the account no longer exists", () => {
    expect(applyAccountState(staleToken(), null)).toBeNull();
  });

  it.each(["DEACTIVATED", "PENDING", "REJECTED"] as const)("ends the session when the account is %s", (status) => {
    expect(applyAccountState(staleToken(), { role: "ADMINISTRATOR", status, photo: null, isSystemAdmin: true })).toBeNull();
  });

  it("downgrades a demoted user's role and System Admin tag from the database", () => {
    const next = applyAccountState(staleToken(), { role: "AGENT", status: "ACTIVE", photo: "p.png", isSystemAdmin: false });
    expect(next).toMatchObject({ id: "u1", role: "AGENT", isSystemAdmin: false, photo: "p.png" });
  });
});
