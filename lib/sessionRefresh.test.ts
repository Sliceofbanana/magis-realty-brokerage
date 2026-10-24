import { describe, expect, it } from "vitest";
import type { JWT } from "next-auth/jwt";
import { applyAccountState, type AccountState } from "@/lib/sessionRefresh";

const SIGNED_IN_AT = Date.parse("2026-10-20T09:00:00Z");

const staleToken = (): JWT => ({
  id: "u1",
  role: "ADMINISTRATOR",
  status: "ACTIVE",
  photo: null,
  isSystemAdmin: true,
  authAt: SIGNED_IN_AT,
});

const account = (over: Partial<AccountState> = {}): AccountState => ({
  role: "ADMINISTRATOR",
  status: "ACTIVE",
  photo: null,
  isSystemAdmin: true,
  passwordChangedAt: null,
  ...over,
});

describe("applyAccountState", () => {
  it("ends the session when the account no longer exists", () => {
    expect(applyAccountState(staleToken(), null)).toBeNull();
  });

  it.each(["DEACTIVATED", "PENDING", "REJECTED"] as const)("ends the session when the account is %s", (status) => {
    expect(applyAccountState(staleToken(), account({ status }))).toBeNull();
  });

  it("downgrades a demoted user's role and System Admin tag from the database", () => {
    const next = applyAccountState(staleToken(), account({ role: "AGENT", photo: "p.png", isSystemAdmin: false }));
    expect(next).toMatchObject({ id: "u1", role: "AGENT", isSystemAdmin: false, photo: "p.png" });
  });

  describe("password changes", () => {
    it("ends a session that was signed in before the password changed", () => {
      const changed = new Date(SIGNED_IN_AT + 60_000);
      expect(applyAccountState(staleToken(), account({ passwordChangedAt: changed }))).toBeNull();
    });

    it("keeps a session that signed in after the password changed", () => {
      const changed = new Date(SIGNED_IN_AT - 60_000);
      expect(applyAccountState(staleToken(), account({ passwordChangedAt: changed }))).not.toBeNull();
    });

    it("ends tokens issued before authAt existed once any password change is recorded", () => {
      const legacy = staleToken();
      delete legacy.authAt;
      expect(applyAccountState(legacy, account({ passwordChangedAt: new Date(1) }))).toBeNull();
    });

    it("leaves legacy tokens alone when the password was never changed", () => {
      const legacy = staleToken();
      delete legacy.authAt;
      expect(applyAccountState(legacy, account())).not.toBeNull();
    });
  });
});
