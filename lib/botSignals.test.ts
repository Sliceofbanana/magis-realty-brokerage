import { describe, expect, it } from "vitest";
import { botFromFormData, botFromValues, evaluateSignals, looksLikeSpam, MIN_FILL_MS, tooLong } from "./botSignals";

describe("evaluateSignals", () => {
  it("accepts a normal human submission", () => {
    expect(evaluateSignals({ hp: "", t: 9000 })).toEqual({ ok: true });
  });
  it("silently drops a filled honeypot", () => {
    expect(evaluateSignals({ hp: "http://spam", t: 9000 })).toEqual({ ok: false, silent: true });
  });
  it("rejects submissions faster than a person can type", () => {
    const v = evaluateSignals({ hp: "", t: MIN_FILL_MS - 1 });
    expect(v.ok).toBe(false);
    expect(v.ok === false && v.silent).toBe(false);
  });
  it("rejects missing or garbage timing (a script that never loaded the form)", () => {
    expect(evaluateSignals(undefined).ok).toBe(false);
    expect(evaluateSignals({}).ok).toBe(false);
    expect(evaluateSignals({ t: NaN }).ok).toBe(false);
  });
});

describe("looksLikeSpam", () => {
  it("allows a couple of links", () => {
    expect(looksLikeSpam("see https://a.com and www.b.com")).toBe(false);
  });
  it("flags link stuffing", () => {
    expect(looksLikeSpam("http://a.com http://b.com", "https://c.com")).toBe(true);
  });
});

describe("tooLong", () => {
  it("caps ordinary fields at 200 and the message at 5000", () => {
    expect(tooLong({ name: "x".repeat(201) })).toBe(true);
    expect(tooLong({ name: "ok", message: "x".repeat(4000) })).toBe(false);
    expect(tooLong({ message: "x".repeat(5001) })).toBe(true);
  });
});

describe("readers", () => {
  it("reads values from a SimpleForm submission", () => {
    expect(botFromValues({ company_website: "", _t: "5000", _cf: "tok" })).toEqual({ hp: "", t: 5000, cf: "tok" });
  });
  it("reads values from FormData", () => {
    const fd = new FormData();
    fd.set("company_website", "x");
    fd.set("_t", "4000");
    expect(botFromFormData(fd)).toEqual({ hp: "x", t: 4000, cf: "" });
  });
});
