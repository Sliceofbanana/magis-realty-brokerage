import { describe, it, expect } from "vitest";
import { maintenanceDecision, featureForPath, sanitizeFeatures, anyMaintenanceActive } from "@/lib/maintenance";

const off = { publicMaintenance: false, portalMaintenance: false, maintenanceFeatures: [] as string[] };

describe("maintenanceDecision", () => {
  it("allows everything when nothing is switched on", () => {
    for (const p of ["/", "/properties", "/portal", "/portal/listings", "/login"]) {
      expect(maintenanceDecision(p, off, false)).toEqual({ kind: "allow" });
    }
  });

  it("public maintenance blocks the website but keeps sign-in and Request Access pages and the portal reachable", () => {
    const s = { ...off, publicMaintenance: true };
    expect(maintenanceDecision("/", s, false)).toMatchObject({ kind: "rewrite", to: "/maintenance?scope=public", status: 503 });
    expect(maintenanceDecision("/properties/azure-bay", s, false)).toMatchObject({ kind: "rewrite" });
    for (const p of ["/login", "/register", "/register/success", "/forgot-password", "/reset-password", "/verify-email", "/maintenance"]) {
      expect(maintenanceDecision(p, s, false)).toEqual({ kind: "allow" });
    }
    expect(maintenanceDecision("/portal/leads", s, false)).toEqual({ kind: "allow" });
  });

  it("does not treat lookalike paths as exempt", () => {
    const s = { ...off, publicMaintenance: true };
    expect(maintenanceDecision("/login-help", s, false)).toMatchObject({ kind: "rewrite" });
    expect(maintenanceDecision("/maintenance-info", s, false)).toMatchObject({ kind: "rewrite" });
  });

  it("portal maintenance takes the whole portal offline but leaves the public site up", () => {
    const s = { ...off, portalMaintenance: true };
    expect(maintenanceDecision("/portal", s, false)).toMatchObject({ kind: "rewrite", to: "/maintenance?scope=portal" });
    expect(maintenanceDecision("/portal/settings", s, false)).toMatchObject({ kind: "rewrite" });
    expect(maintenanceDecision("/", s, false)).toEqual({ kind: "allow" });
  });

  it("feature maintenance blocks only that feature (and its sub-pages)", () => {
    const s = { ...off, maintenanceFeatures: ["leads", "attendance"] };
    expect(maintenanceDecision("/portal/leads", s, false)).toMatchObject({ kind: "rewrite", to: "/portal/maintenance?feature=leads" });
    expect(maintenanceDecision("/portal/attendance/abc123", s, false)).toMatchObject({ to: "/portal/maintenance?feature=attendance" });
    expect(maintenanceDecision("/portal/listings", s, false)).toEqual({ kind: "allow" });
    expect(maintenanceDecision("/portal", s, false)).toEqual({ kind: "allow" });
    expect(maintenanceDecision("/portal/leadership", s, false)).toEqual({ kind: "allow" }); // not "/portal/leads"
  });

  it("never blocks a System Admin, and never loops on the maintenance pages themselves", () => {
    const all = { publicMaintenance: true, portalMaintenance: true, maintenanceFeatures: ["leads"] };
    for (const p of ["/", "/portal", "/portal/leads", "/portal/system"]) {
      expect(maintenanceDecision(p, all, true)).toEqual({ kind: "allow" });
    }
    expect(maintenanceDecision("/maintenance", all, false)).toEqual({ kind: "allow" });
    expect(maintenanceDecision("/portal/maintenance", all, false)).toEqual({ kind: "allow" });
  });
});

describe("helpers", () => {
  it("maps paths to features", () => {
    expect(featureForPath("/portal/commissions")).toBe("commissions");
    expect(featureForPath("/portal/users/x")).toBe("users");
    expect(featureForPath("/portal")).toBeNull();
    expect(featureForPath("/portal/settings")).toBeNull();
  });

  it("sanitizes feature lists", () => {
    expect(sanitizeFeatures(["leads", "leads", "nope", 5, "users"])).toEqual(["leads", "users"]);
    expect(sanitizeFeatures("leads")).toEqual([]);
  });

  it("detects whether any maintenance is active", () => {
    expect(anyMaintenanceActive(off)).toBe(false);
    expect(anyMaintenanceActive({ ...off, maintenanceFeatures: ["blogs"] })).toBe(true);
  });
});
