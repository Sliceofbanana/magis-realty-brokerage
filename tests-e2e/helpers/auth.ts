import { Page, expect } from "@playwright/test";
import { E2E_ADMIN_EMAIL, E2E_AGENT_EMAIL } from "./accounts";

export const ADMIN_EMAIL = E2E_ADMIN_EMAIL;
export const AGENT_EMAIL = E2E_AGENT_EMAIL;

const PASSWORD_ENV: Record<string, string> = {
  [E2E_ADMIN_EMAIL]: "E2E_ADMIN_PASSWORD",
  [E2E_AGENT_EMAIL]: "E2E_AGENT_PASSWORD",
};

/** Password of one of the suite's own test accounts (created in global-setup.ts). */
export function passwordFor(email: string): string {
  const password = process.env[PASSWORD_ENV[email]];
  if (!password) throw new Error(`No test password for ${email} — did global-setup run?`);
  return password;
}

/** Logs in through the real login form and waits for the portal to load. */
export async function loginAs(page: Page, email: string, password = passwordFor(email)) {
  await page.goto("/login");
  await page.getByPlaceholder("agent@magisrealty.com").fill(email);
  await page.getByPlaceholder("••••••••••••").fill(password);
  await page.getByRole("button", { name: "Enter Portal" }).click();
  await expect(page).toHaveURL(/\/portal/);
}
