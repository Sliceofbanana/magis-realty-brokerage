import { test, expect } from "@playwright/test";
import { db } from "./helpers/db";
import { loginAs, AGENT_EMAIL } from "./helpers/auth";

test.describe("Attendance check-in", () => {
  let meetingId: string;
  const meetingTitle = `E2E Check-in Meeting ${Date.now()}`;

  test.beforeAll(async () => {
    const agent = await db.user.findUniqueOrThrow({ where: { email: AGENT_EMAIL } });
    const meeting = await db.meeting.create({
      data: {
        title: meetingTitle,
        type: "MEETING",
        date: new Date(),
        checkInMode: "BUTTON",
      },
    });
    meetingId = meeting.id;
    await db.attendanceRecord.create({
      data: { meetingId: meeting.id, agentId: agent.id, status: "UPCOMING" },
    });
  });

  test.afterAll(async () => {
    await db.attendanceRecord.deleteMany({ where: { meetingId } });
    await db.meeting.delete({ where: { id: meetingId } }).catch(() => {});
  });

  test("agent can mark themselves attended via the button, and it persists", async ({ page }) => {
    await loginAs(page, AGENT_EMAIL);
    await page.goto("/portal/attendance");

    await expect(page.getByText("Needs Check-in")).toBeVisible();
    const meetingItem = page.getByRole("listitem").filter({ hasText: meetingTitle });
    await meetingItem.getByRole("button", { name: "Mark Attended" }).click();

    // The list re-renders with this specific meeting moved into History as Attended.
    const historyItem = page.getByRole("listitem").filter({ hasText: meetingTitle });
    await expect(historyItem.getByText("Attended")).toBeVisible();

    await expect
      .poll(async () => (await db.attendanceRecord.findFirst({ where: { meetingId } }))?.status, {
        timeout: 5000,
      })
      .toBe("ATTENDED");
    const record = await db.attendanceRecord.findFirst({ where: { meetingId } });
    expect(record?.checkedInAt).not.toBeNull();
  });
});

test.describe("QR check-in", () => {
  let meetingId: string;
  let token: string;
  let agentId: string;
  const meetingTitle = `E2E QR Meeting ${Date.now()}`;

  test.beforeAll(async () => {
    const agent = await db.user.findUniqueOrThrow({ where: { email: AGENT_EMAIL } });
    agentId = agent.id;
    const meeting = await db.meeting.create({
      data: { title: meetingTitle, type: "MEETING", date: new Date(), checkInMode: "QR" },
    });
    meetingId = meeting.id;
    token = meeting.checkInToken;
    await db.attendanceRecord.create({ data: { meetingId, agentId, status: "UPCOMING" } });
  });

  test.afterAll(async () => {
    await db.attendanceRecord.deleteMany({ where: { meetingId } });
    await db.meeting.delete({ where: { id: meetingId } }).catch(() => {});
  });

  const statusNow = async () => (await db.attendanceRecord.findFirst({ where: { meetingId, agentId } }))?.status;

  test("the attendee's own page never shows the token or a check-in button", async ({ page }) => {
    await loginAs(page, AGENT_EMAIL);
    await page.goto("/portal/attendance");
    const item = page.getByRole("listitem").filter({ hasText: meetingTitle });
    await expect(item.getByText(/scan the qr code/i)).toBeVisible();
    await expect(item.getByRole("button", { name: "Mark Attended" })).toHaveCount(0);
    expect(await page.content()).not.toContain(token);
  });

  test("opening the check-in page without the token does not check anyone in", async ({ page }) => {
    await loginAs(page, AGENT_EMAIL);
    await page.goto(`/portal/attendance/checkin/${meetingId}`);
    await expect(page.getByText(/scan the qr code/i)).toBeVisible();
    expect(await statusNow()).toBe("UPCOMING");
  });

  test("a wrong token is refused", async ({ page }) => {
    await loginAs(page, AGENT_EMAIL);
    await page.goto(`/portal/attendance/checkin/${meetingId}?token=${"0".repeat(token.length)}`);
    await expect(page.getByText(/invalid check-in link/i)).toBeVisible();
    expect(await statusNow()).toBe("UPCOMING");
  });

  test("scanning the real QR (the tokenised link) checks the attendee in", async ({ page }) => {
    await loginAs(page, AGENT_EMAIL);
    await page.goto(`/portal/attendance/checkin/${meetingId}?token=${token}`);
    await expect(page.getByText(/you.re checked in/i)).toBeVisible();
    expect(await statusNow()).toBe("ATTENDED");
  });
});
