import { describe, it, expect } from "vitest";
import { escapeHtml } from "@/lib/htmlEscape";

describe("escapeHtml", () => {
  it("neutralizes an HTML-injection attempt so it can't break out of markup", () => {
    const malicious = `<img src=x onerror=alert(1)>`;
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain("<img");
    expect(escaped).toBe("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("escapes quotes so attribute contexts can't be broken out of", () => {
    expect(escapeHtml(`"onmouseover="alert(1)`)).toBe("&quot;onmouseover=&quot;alert(1)");
    expect(escapeHtml(`'; alert(1); '`)).toBe("&#39;; alert(1); &#39;");
  });

  it("leaves an ordinary name untouched", () => {
    expect(escapeHtml("Julianna De-Marko")).toBe("Julianna De-Marko");
  });

  it("escapes ampersands without double-escaping other entities", () => {
    expect(escapeHtml("Smith & Sons")).toBe("Smith &amp; Sons");
  });
});
