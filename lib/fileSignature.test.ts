import { describe, expect, it } from "vitest";
import { detectFileKind, kindFromExtension } from "@/lib/fileSignature";

const buf = (...parts: (number[] | string)[]) =>
  Buffer.concat(parts.map((p) => (typeof p === "string" ? Buffer.from(p, "latin1") : Buffer.from(p))));

describe("detectFileKind", () => {
  it("recognises JPEG, PNG and WebP by magic bytes", () => {
    expect(detectFileKind(buf([0xff, 0xd8, 0xff, 0xe0], "JFIF"))).toBe("jpg");
    expect(detectFileKind(buf([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "rest"))).toBe("png");
    expect(detectFileKind(buf("RIFF", [1, 2, 3, 4], "WEBPVP8 "))).toBe("webp");
  });

  it("recognises a PDF, tolerating a little leading junk", () => {
    expect(detectFileKind(buf("%PDF-1.7\n..."))).toBe("pdf");
    expect(detectFileKind(buf("\n\n  %PDF-1.4"))).toBe("pdf");
  });

  it("tells Word from Excel inside a zip", () => {
    expect(detectFileKind(buf([0x50, 0x4b, 0x03, 0x04], "....word/document.xml...."))).toBe("docx");
    expect(detectFileKind(buf([0x50, 0x4b, 0x03, 0x04], "....xl/workbook.xml...."))).toBe("xlsx");
  });

  it("rejects a plain zip, and other things renamed to look like documents", () => {
    expect(detectFileKind(buf([0x50, 0x4b, 0x03, 0x04], "just a zip of something"))).toBeNull();
    expect(detectFileKind(buf("<html><script>alert(1)</script></html>"))).toBeNull();
    expect(detectFileKind(buf('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
    expect(detectFileKind(buf("MZ", [0x90, 0x00]))).toBeNull(); // Windows executable
    expect(detectFileKind(Buffer.alloc(0))).toBeNull();
  });

  it("does not take a PDF marker buried deep in a file", () => {
    expect(detectFileKind(Buffer.concat([Buffer.alloc(2048, 0x41), Buffer.from("%PDF-1.4")]))).toBeNull();
  });
});

describe("kindFromExtension", () => {
  it("maps extensions case-insensitively, including jpeg", () => {
    expect(kindFromExtension("JPEG")).toBe("jpg");
    expect(kindFromExtension("pdf")).toBe("pdf");
  });

  it("returns null for anything else", () => {
    expect(kindFromExtension("exe")).toBeNull();
    expect(kindFromExtension("svg")).toBeNull();
    expect(kindFromExtension("")).toBeNull();
  });
});
