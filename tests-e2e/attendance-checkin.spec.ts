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
