import { test, expect } from "@playwright/test";
import { loginAs, ADMIN_EMAIL } from "./helpers/auth";

test.describe("Login", () => {
  test("valid credentials reach the portal", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  });

  test("invalid credentials show an error and stay on login", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("agent@magisrealty.com").fill(ADMIN_EMAIL);
    await page.getByPlaceholder("••••••••••••").fill("wrong-password-entirely");
    await page.getByRole("button", { name: "Enter Portal" }).click();

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
    await expect(page).not.toHaveURL(/\/portal/);
  });

  test("logging out returns to the login page", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.getByRole("button", { name: /account menu/i }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Enter Portal" })).toBeVisible();
  });
});
