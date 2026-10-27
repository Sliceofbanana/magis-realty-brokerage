import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

const body = (csv: string) => csv.replace("﻿", "");

describe("toCsv", () => {
  it("writes a header and rows with CRLF line endings and a BOM", () => {
    const csv = toCsv(["a", "b"], [["1", 2]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(body(csv)).toBe("a,b\r\n1,2\r\n");
  });

  it("quotes cells containing commas, quotes or line breaks", () => {
    expect(body(toCsv(["x"], [['say "hi", ok'], ["two\nlines"]]))).toBe('x\r\n"say ""hi"", ok"\r\n"two\nlines"\r\n');
  });

  it("renders null, undefined, booleans and dates predictably", () => {
    const when = new Date("2026-10-27T01:02:03.000Z");
    expect(body(toCsv(["a", "b", "c", "d"], [[null, undefined, true, when]]))).toBe(
      "a,b,c,d\r\n,,true,2026-10-27T01:02:03.000Z\r\n"
    );
  });

  it("defuses spreadsheet formulas in text", () => {
    const rows = [["=HYPERLINK(\"http://evil\")"], ["+1"], ["-1"], ["@SUM(A1)"]];
    const lines = body(toCsv(["x"], rows)).trim().split("\r\n").slice(1);
    for (const line of lines) expect(line.replace(/^"/, "").startsWith("'")).toBe(true);
  });

  it("leaves real numbers alone, including negatives", () => {
    expect(body(toCsv(["n"], [[-5]]))).toBe("n\r\n-5\r\n");
  });
});
