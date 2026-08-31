import { test, expect } from "@playwright/test";
import { db } from "./helpers/db";
import { loginAs, ADMIN_EMAIL } from "./helpers/auth";

test.describe("Public inquiry", () => {
  const testEmail = `e2e-inquiry-${Date.now()}@example.com`;
  const testName = `E2E Inquiry Test ${Date.now()}`;

  test.afterAll(async () => {
    await db.lead.deleteMany({ where: { email: testEmail } });
    await db.notification.deleteMany({ where: { body: { contains: testName } } });
  });

  test("submitting the contact form creates a real Lead and a Notification", async ({ page }) => {
    await page.goto("/contact");
    await page.getByPlaceholder("e.g. Alexander Vance").fill(testName);
    await page.getByPlaceholder("alexander@luxe.com").fill(testEmail);
    await page.getByPlaceholder("+63 900 000 0000").fill("+639171234567");
    await page.getByLabel("Interest").selectOption("Penthouse Collections");
    await page.getByRole("button", { name: "Send Inquiry" }).click();

    await expect(page.getByText(/Thank you!/i)).toBeVisible();

    const lead = await db.lead.findFirst({ where: { email: testEmail } });
    expect(lead).not.toBeNull();
    expect(lead?.name).toBe(testName);
    expect(lead?.source).toBe("Contact Page");

    const notification = await db.notification.findFirst({
      where: { type: "NEW_LEAD", body: { contains: testName } },
    });
    expect(notification).not.toBeNull();
  });

  test("the new lead is visible on the admin Leads page", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/portal/leads");
    await expect(page.getByText(testName)).toBeVisible();
  });
});
