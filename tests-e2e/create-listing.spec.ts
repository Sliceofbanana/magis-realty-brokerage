import { test, expect } from "@playwright/test";
import { db } from "./helpers/db";
import { loginAs, ADMIN_EMAIL } from "./helpers/auth";

test.describe("Listing creation", () => {
  const title = `E2E Test Listing ${Date.now()}`;

  test.afterAll(async () => {
    await db.property.deleteMany({ where: { title } });
  });

  test("admin can create a listing and it appears on the public site", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/portal/listings");
    await page.getByRole("button", { name: "Add New Listing" }).click();

    await page.locator("#title").fill(title);
    await page.locator("#location").fill("Cebu Business Park, Cebu City");
    await page.locator("#address").fill("123 E2E Test Street, Cebu City");
    await page.locator("#price").fill("3500000");
    await page.locator("#area").fill("150");
    // First real option after the disabled "Select an agent" placeholder.
    await page.locator("#agentId").selectOption({ index: 1 });

    await page.getByRole("button", { name: "Create Listing" }).click();

    // Modal closes on success (its own success signal — no toast in this app).
    await expect(page.locator("#create-listing-title")).toHaveCount(0);
    await expect(page.getByText(title)).toBeVisible();

    const created = await db.property.findFirst({ where: { title } });
    expect(created).not.toBeNull();
    expect(created?.slug).toBeTruthy();

    // Public site reflects it immediately.
    await page.goto(`/properties/${created!.slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });
});
