import { test, expect } from "@playwright/test";
import { db } from "./helpers/db";
import { loginAs, ADMIN_EMAIL } from "./helpers/auth";

test.describe("Careers application", () => {
  const applicantName = `E2E Applicant ${Date.now()}`;
  const applicantEmail = `e2e-applicant-${Date.now()}@example.com`;

  test.afterAll(async () => {
    await db.jobApplication.deleteMany({ where: { email: applicantEmail } });
    await db.notification.deleteMany({ where: { body: { contains: applicantName } } });
  });

  test("submitting an open application via role=Marketing pre-fills and saves correctly", async ({
    page,
  }) => {
    await page.goto("/careers?role=Marketing#apply");
    await expect(page.locator("#expertise")).toHaveValue("Marketing");

    await page.locator("#name").fill(applicantName);
    await page.locator("#email").fill(applicantEmail);
    await page.getByRole("button", { name: "Send Open Application" }).click();

    await expect(page.getByText(/Thank you!/i)).toBeVisible();

    const application = await db.jobApplication.findFirst({ where: { email: applicantEmail } });
    expect(application).not.toBeNull();
    expect(application?.positionInterest).toBe("Marketing");
    expect(application?.status).toBe("APPLIED");
  });

  test("the new applicant is visible on the admin Careers page", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/portal/careers");
    await expect(page.getByText(applicantName)).toBeVisible();
  });
});
