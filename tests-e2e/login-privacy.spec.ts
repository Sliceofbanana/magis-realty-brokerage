import { test, expect } from "@playwright/test";
import bcrypt from "bcryptjs";
import { db } from "./helpers/db";
import { waitUntilHumanSpeed } from "./helpers/bot";

/**
 * The login and registration forms must not reveal which emails have accounts
 * or what state those accounts are in — until the password has been proven.
 */
test.describe("Account privacy on login and registration", () => {
  const stamp = Date.now();
  const password = `Privacy-${stamp}-pw`;
  const email = (tag: string) => `e2e-privacy-${stamp}-${tag}@example.test`;
  const accounts = [
    { tag: "pending", status: "PENDING", verified: true, message: /pending admin approval/i },
    { tag: "deactivated", status: "DEACTIVATED", verified: true, message: /has been deactivated/i },
    { tag: "rejected", status: "REJECTED", verified: true, message: /not approved/i },
    { tag: "unverified", status: "ACTIVE", verified: false, message: /verify your email/i },
  ] as const;

  test.beforeAll(async () => {
    const passwordHash = await bcrypt.hash(password, 10);
    for (const a of accounts) {
      await db.user.create({
        data: {
          email: email(a.tag),
          name: `E2E ${a.tag}`,
          passwordHash,
          role: "AGENT",
          status: a.status,
          emailVerified: a.verified ? new Date() : null,
        },
      });
    }
  });

  test.afterAll(async () => {
    await db.user.deleteMany({ where: { email: { startsWith: `e2e-privacy-${stamp}-` } } });
  });

  async function submitLogin(page: import("@playwright/test").Page, emailValue: string, pw: string) {
    await page.goto("/login");
    await page.getByPlaceholder("agent@magisrealty.com").fill(emailValue);
    await page.getByPlaceholder("••••••••••••").fill(pw);
    await page.getByRole("button", { name: "Enter Portal" }).click();
  }

  test("a wrong password gets the same answer whatever the account's state — and for unknown emails", async ({ page }) => {
    for (const emailValue of [...accounts.map((a) => email(a.tag)), `e2e-nobody-${stamp}@example.test`]) {
      await submitLogin(page, emailValue, "definitely-not-the-password");
      await expect(page.getByText("Invalid email or password.")).toBeVisible();
      await expect(page.getByText(/pending|deactivated|not approved|verify your email/i)).toHaveCount(0);
    }
  });

  for (const a of accounts) {
    test(`the right password for a ${a.tag} account explains why sign-in is blocked`, async ({ page }) => {
      await submitLogin(page, email(a.tag), password);
      await expect(page.getByText(a.message)).toBeVisible();
      await expect(page).not.toHaveURL(/\/portal/);
    });
  }

  test("registering an address that already has an account looks like any other registration", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Jane Dela Cruz").fill("Someone Else");
    await page.getByPlaceholder("jane@example.com").fill(email("pending"));
    await page.getByPlaceholder("Min. 12 characters").fill("a-perfectly-long-password");
    await waitUntilHumanSpeed(page);
    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page).toHaveURL(/\/register\/success/);
    await expect(page.getByText(/already exists/i)).toHaveCount(0);
    // …and nothing was created or changed for the existing account.
    expect(await db.user.count({ where: { email: email("pending") } })).toBe(1);
  });
});
