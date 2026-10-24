import { describe, expect, it } from "vitest";
import { InvalidFileError, inspectUpload } from "@/lib/storage";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const file = (name: string, body: Buffer | string, type = "application/octet-stream") =>
  new File([typeof body === "string" ? Buffer.from(body) : new Uint8Array(body)], name, { type });

describe("inspectUpload", () => {
  it("accepts a file whose extension and contents agree", async () => {
    const r = await inspectUpload(file("photo.png", PNG), ["jpg", "png"]);
    expect(r.kind).toBe("png");
    expect(r.buffer.length).toBe(PNG.length);
  });

  it("treats .jpeg as jpg", async () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
    expect((await inspectUpload(file("a.JPEG", jpeg), ["jpg"])).kind).toBe("jpg");
  });

  it("rejects HTML renamed to .pdf, whatever Content-Type the browser claims", async () => {
    const html = file("invoice.pdf", "<html><script>alert(1)</script></html>", "application/pdf");
    await expect(inspectUpload(html, ["pdf"])).rejects.toBeInstanceOf(InvalidFileError);
  });

  it("rejects an SVG even when named .png", async () => {
    const svg = file("logo.png", '<svg xmlns="http://www.w3.org/2000/svg"/>', "image/png");
    await expect(inspectUpload(svg, ["png"])).rejects.toBeInstanceOf(InvalidFileError);
  });

  it("rejects a real image whose extension says it is something else", async () => {
    await expect(inspectUpload(file("photo.pdf", PNG), ["pdf", "png"])).rejects.toBeInstanceOf(InvalidFileError);
  });

  it("rejects extensions outside the allowed list, even if the contents are fine", async () => {
    await expect(inspectUpload(file("photo.png", PNG), ["pdf"])).rejects.toBeInstanceOf(InvalidFileError);
    await expect(inspectUpload(file("noextension", PNG), ["png"])).rejects.toBeInstanceOf(InvalidFileError);
  });

  it("rejects an empty file", async () => {
    await expect(inspectUpload(file("empty.png", Buffer.alloc(0)), ["png"])).rejects.toBeInstanceOf(InvalidFileError);
  });
});
