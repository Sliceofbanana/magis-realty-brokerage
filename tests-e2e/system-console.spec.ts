import { readFile } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
import { db } from "./helpers/db";
import { loginAs, ADMIN_EMAIL, AGENT_EMAIL } from "./helpers/auth";

/**
 * The System page's console tabs (Controls, General, Workflow, Notifications,
 * Security, Audit log, Data, Integrations, Health). The suite's admin is tagged
 * a System Admin for this file only.
 */
const PROBE = "E2E Probe";

async function openTab(page: Page, name: string) {
  await page.getByRole("tab", { name }).click();
  await expect(page.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true");
}

test.describe("System console", () => {
  test.describe.configure({ mode: "serial" });

  const leadEmail = `e2e-formula-${Date.now()}@example.test`;

  test.beforeAll(async () => {
    await db.user.update({ where: { email: ADMIN_EMAIL }, data: { isSystemAdmin: true } });
    await db.activityLogEntry.createMany({
      data: [
        { userLabel: PROBE, action: "E2E probe alpha", module: "Leads", createdAt: new Date("2020-01-15T01:00:00+08:00") },
        { userLabel: PROBE, action: "E2E probe bravo", module: "Leads", createdAt: new Date("2020-03-10T12:00:00+08:00") },
      ],
    });
  });

  test.afterAll(async () => {
    await db.user.update({ where: { email: ADMIN_EMAIL }, data: { isSystemAdmin: false } });
    await db.activityLogEntry.deleteMany({ where: { userLabel: PROBE } });
    await db.lead.deleteMany({ where: { email: leadEmail } });
  });

  test("every tab opens and loads its data", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/portal/system");

    const expected: [string, RegExp][] = [
      ["General", /Identity and regional defaults/],
      ["Workflow", /Lead pipeline stages/],
      ["Notifications", /Who gets alerted/],
      ["Security", /Password policy/],
      ["Audit log", /Showing 1–/],
      ["Data", /Export data/],
      ["Integrations", /Database/],
      ["Health", /Response time/],
    ];
    for (const [tab, text] of expected) {
      await openTab(page, tab);
      await expect(page.getByText(text).first()).toBeVisible();
      await expect(page.getByText("Couldn't load")).toHaveCount(0);
    }

    // The database is the local one, so these two must be healthy.
    await expect(page.getByText("Connected").first()).toBeVisible();
  });

  test("unsaved control changes survive a look at another tab", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/portal/system");

    await page.getByRole("switch", { name: "Accept new registrations" }).click();
    await expect(page.getByText("You have unsaved changes.")).toBeVisible();

    await openTab(page, "General");
    await openTab(page, "Controls");
    await expect(page.getByText("You have unsaved changes.")).toBeVisible();

    await page.getByRole("button", { name: "Discard" }).click();
    await expect(page.getByText("No changes.")).toBeVisible();
  });

  test("signing in and a failed sign-in are recorded, and unknown emails are not", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("agent@magisrealty.com").fill(AGENT_EMAIL);
    await page.getByPlaceholder("••••••••••••").fill("definitely-not-the-password");
    await page.getByRole("button", { name: "Enter Portal" }).click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();

    await page.getByPlaceholder("agent@magisrealty.com").fill("nobody-here@example.test");
    await page.getByRole("button", { name: "Enter Portal" }).click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();

    await expect
      .poll(() => db.activityLogEntry.count({ where: { userLabel: "E2E Agent", action: "Failed sign-in", module: "Security" } }))
      .toBeGreaterThan(0);
    // Written after the response, so give a stray write for the unknown email time to show up.
    await page.waitForTimeout(1500);
    expect(await db.activityLogEntry.count({ where: { action: "Failed sign-in", userLabel: { contains: "nobody-here" } } })).toBe(0);

    await loginAs(page, ADMIN_EMAIL);
    await expect
      .poll(() => db.activityLogEntry.count({ where: { userLabel: "E2E Admin", action: "Signed in", module: "Security" } }))
      .toBeGreaterThan(0);

    await page.goto("/portal/system");
    await openTab(page, "Audit log");
    await page.getByRole("button", { name: "Security events" }).click();
    await expect(page.getByRole("cell", { name: "Failed sign-in" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "Signed in" }).first()).toBeVisible();
  });

  test("the audit log searches and filters by day in Manila time", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/portal/system");
    await openTab(page, "Audit log");

    await page.getByLabel("Search", { exact: true }).fill("E2E probe");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByRole("cell", { name: "E2E probe alpha" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "E2E probe bravo" })).toBeVisible();

    // 01:00 on 15 Jan in Manila is still 14 Jan in UTC: the day filter has to follow Manila.
    await page.getByLabel("From", { exact: true }).fill("2020-01-15");
    await page.getByLabel("To", { exact: true }).fill("2020-01-15");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByRole("cell", { name: "E2E probe alpha" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "E2E probe bravo" })).toHaveCount(0);

    await page.getByRole("button", { name: "Reset" }).click();
    await page.getByLabel("Search", { exact: true }).fill("zzz-no-such-entry");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByText("No entries match these filters.")).toBeVisible();
  });

  test("the audit log exports a CSV of the current filter and records the export", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/portal/system");
    await openTab(page, "Audit log");

    await page.getByLabel("Search", { exact: true }).fill("E2E probe alpha");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.getByRole("cell", { name: "E2E probe alpha" })).toBeVisible();

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV" }).click()]);
    expect(download.suggestedFilename()).toMatch(/^audit-log-\d{4}-\d{2}-\d{2}\.csv$/);
    const csv = await readFile((await download.path())!, "utf8");
    expect(csv).toContain("Time (Manila)");
    expect(csv).toContain("E2E probe alpha");
    expect(csv).not.toContain("E2E probe bravo");

    await expect
      .poll(() => db.activityLogEntry.count({ where: { userLabel: "E2E Admin", module: "Security", action: { startsWith: "Exported" } } }))
      .toBeGreaterThan(0);
  });

  test("data exports download as CSV and neutralize spreadsheet formulas", async ({ page }) => {
    await db.lead.create({
      data: { name: '=HYPERLINK("http://evil.test","click")', email: leadEmail, phone: "0", source: "E2E" },
    });

    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/portal/system");
    await openTab(page, "Data");

    const row = page.getByRole("listitem").filter({ hasText: "Every inquiry and lead" });
    const [download] = await Promise.all([page.waitForEvent("download"), row.getByRole("button", { name: "Download CSV" }).click()]);
    expect(download.suggestedFilename()).toMatch(/^leads-\d{4}-\d{2}-\d{2}\.csv$/);
    const csv = await readFile((await download.path())!, "utf8");
    expect(csv).toContain(leadEmail);
    expect(csv).toContain(`"'=HYPERLINK(""http://evil.test"",""click"")"`);
    expect(csv).not.toMatch(/,=HYPERLINK/);

    const users = page.getByRole("listitem").filter({ hasText: "Passwords are never included" });
    const [usersDownload] = await Promise.all([page.waitForEvent("download"), users.getByRole("button", { name: "Download CSV" }).click()]);
    const usersCsv = await readFile((await usersDownload.path())!, "utf8");
    expect(usersCsv).not.toMatch(/\$2[aby]\$/); // no bcrypt hashes
    expect(usersCsv).not.toContain("passwordHash");
  });

  test("a System Admin can force a sign-out, and the person is signed out", async ({ page, browser }) => {
    const agentContext = await browser.newContext();
    const agentPage = await agentContext.newPage();
    await loginAs(agentPage, AGENT_EMAIL);
    await agentPage.goto("/portal");
    await expect(agentPage).toHaveURL(/\/portal/);

    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/portal/system");
    await openTab(page, "Security");

    // You can't sign yourself out from here.
    await expect(page.getByRole("button", { name: "Sign E2E Admin out everywhere" })).toHaveCount(0);

    await page.getByRole("button", { name: "Sign E2E Agent out everywhere" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByText(/E2E Agent will be signed out/)).toBeVisible();

    // The agent's token is re-checked within ~15 seconds, then they land back on the login page.
    await expect(async () => {
      await agentPage.goto("/portal");
      await expect(agentPage).toHaveURL(/\/login/);
    }).toPass({ timeout: 40_000, intervals: [2_000] });

    await expect
      .poll(() => db.activityLogEntry.count({ where: { userLabel: "E2E Admin", action: "Forced sign-out of E2E Agent" } }))
      .toBeGreaterThan(0);
    await agentContext.close();
  });

  test("people who aren't System Admins don't get the console", async ({ page }) => {
    await loginAs(page, AGENT_EMAIL);
    await page.goto("/portal/system");
    await expect(page.getByRole("tab", { name: "Audit log" })).toHaveCount(0);
    await expect(page.getByText("Error 404")).toBeVisible();
  });
});
