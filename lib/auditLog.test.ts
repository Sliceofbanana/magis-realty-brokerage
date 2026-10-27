import { describe, expect, it } from "vitest";
import { buildAuditWhere, clampPage, manilaDayStart, SECURITY_MODULES } from "@/lib/auditLog";

describe("manilaDayStart", () => {
  it("returns midnight Manila time, which is 16:00 UTC the day before", () => {
    expect(manilaDayStart("2026-10-27")?.toISOString()).toBe("2026-10-26T16:00:00.000Z");
  });

  it("rejects anything that isn't a real YYYY-MM-DD day", () => {
    for (const bad of ["", "27/10/2026", "2026-13-01", "2026-02-30", "2026-10-27T00:00", "'; drop table"]) {
      expect(manilaDayStart(bad)).toBeNull();
    }
  });
});

describe("buildAuditWhere", () => {
  it("is empty when nothing is filtered", () => {
    expect(buildAuditWhere({})).toEqual({});
    expect(buildAuditWhere({ q: "   ", module: "", from: "nope" })).toEqual({});
  });

  it("filters by module", () => {
    expect(buildAuditWhere({ module: "Leads" })).toEqual({ module: "Leads" });
  });

  it("limits to the security modules, but a chosen module wins", () => {
    expect(buildAuditWhere({ securityOnly: true })).toEqual({ module: { in: [...SECURITY_MODULES] } });
    expect(buildAuditWhere({ securityOnly: true, module: "Leads" })).toEqual({ module: "Leads" });
  });

  it("searches both the action and the person, case-insensitively", () => {
    expect(buildAuditWhere({ q: " login " })).toEqual({
      OR: [
        { action: { contains: "login", mode: "insensitive" } },
        { userLabel: { contains: "login", mode: "insensitive" } },
      ],
    });
  });

  it("treats the date range as inclusive of the last day", () => {
    const where = buildAuditWhere({ from: "2026-10-01", to: "2026-10-02" });
    expect(where.createdAt?.gte?.toISOString()).toBe("2026-09-30T16:00:00.000Z");
    // "to" Oct 2 runs through the end of Oct 2, i.e. up to (not including) Oct 3 00:00 Manila.
    expect(where.createdAt?.lt?.toISOString()).toBe("2026-10-02T16:00:00.000Z");
  });

  it("supports an open-ended range", () => {
    expect(buildAuditWhere({ from: "2026-10-01" }).createdAt?.lt).toBeUndefined();
    expect(buildAuditWhere({ to: "2026-10-01" }).createdAt?.gte).toBeUndefined();
  });
});

describe("clampPage", () => {
  it("keeps pages within range and defaults to 1", () => {
    expect(clampPage(undefined, 5)).toBe(1);
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(-3, 5)).toBe(1);
    expect(clampPage(99, 5)).toBe(5);
    expect(clampPage(2.9, 5)).toBe(2);
    expect(clampPage(NaN, 5)).toBe(1);
    expect(clampPage(3, 0)).toBe(1);
  });
});
