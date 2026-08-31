import { Page, expect } from "@playwright/test";

export const ADMIN_EMAIL = "julianna@magisrealty.com";
export const AGENT_EMAIL = "agent.smith@magisrealty.com";
export const DEMO_PASSWORD = "Password123!";

/** Logs in through the real login form and waits for the portal to load. */
export async function loginAs(page: Page, email: string, password = DEMO_PASSWORD) {
  await page.goto("/login");
  await page.getByPlaceholder("agent@magisrealty.com").fill(email);
  await page.getByPlaceholder("••••••••••••").fill(password);
  await page.getByRole("button", { name: "Enter Portal" }).click();
  await expect(page).toHaveURL(/\/portal/);
}
