import { describe, expect, it } from "vitest";
import { builtInDefault, isAdminLocked, resolvePermission, toEnumKey } from "@/lib/permissionResolution";

describe("resolvePermission", () => {
  it("a per-user override beats the role default, in both directions", () => {
    expect(resolvePermission({ role: "AGENT", permission: "MANAGE_USERS", override: true, roleDefault: false })).toBe(true);
    expect(resolvePermission({ role: "BROKER", permission: "SET_AGENT_QUOTAS", override: false, roleDefault: true })).toBe(false);
  });

  it("an Administrator's own override can revoke an ordinary permission", () => {
    expect(resolvePermission({ role: "ADMINISTRATOR", permission: "MANAGE_USERS", override: false, roleDefault: true })).toBe(false);
  });

  it("uses the role default when there is no override", () => {
    expect(resolvePermission({ role: "MARKETING", permission: "MANAGE_BLOGS", roleDefault: true })).toBe(true);
    expect(resolvePermission({ role: "MARKETING", permission: "MANAGE_BLOGS", roleDefault: false })).toBe(false);
  });

  it("falls back to the built-in matrix when the database has no row", () => {
    expect(resolvePermission({ role: "ADMINISTRATOR", permission: "MANAGE_USERS" })).toBe(true);
    expect(resolvePermission({ role: "MARKETING", permission: "MANAGE_BLOGS" })).toBe(true);
    expect(resolvePermission({ role: "AGENT", permission: "MANAGE_USERS" })).toBe(false);
    expect(resolvePermission({ role: "BROKER", permission: "MANAGE_BLOGS" })).toBe(false);
  });

  it("Manage Permissions is always an Administrator's and never anyone else's", () => {
    expect(isAdminLocked("MANAGE_PERMISSIONS")).toBe(true);
    expect(resolvePermission({ role: "ADMINISTRATOR", permission: "MANAGE_PERMISSIONS", override: false, roleDefault: false })).toBe(true);
    expect(resolvePermission({ role: "BROKER", permission: "MANAGE_PERMISSIONS", override: true, roleDefault: true })).toBe(false);
  });

  it("only that key is locked", () => {
    expect(isAdminLocked("MANAGE_USERS")).toBe(false);
  });
});

describe("helpers", () => {
  it("maps kebab-case keys to enum keys", () => {
    expect(toEnumKey("view-activity-log")).toBe("VIEW_ACTIVITY_LOG");
  });

  it("builtInDefault mirrors the static matrix", () => {
    expect(builtInDefault("BROKER", "VIEW_ACTIVITY_LOG")).toBe(true);
    expect(builtInDefault("AGENT", "VIEW_ACTIVITY_LOG")).toBe(false);
  });
});
