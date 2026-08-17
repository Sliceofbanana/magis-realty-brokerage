"use server";

import { revalidatePath } from "next/cache";
import { AttendanceCheckInMode, AttendanceStatus, AttendanceType } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/users";

export type CreateMeetingResult = { error?: string; success?: boolean };

/** Admin-only: creates a Meeting plus one UPCOMING AttendanceRecord per selected attendee. */
export async function createMeetingAction(
  _prevState: CreateMeetingResult,
  formData: FormData
): Promise<CreateMeetingResult> {
  const session = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "");
  const dateRaw = String(formData.get("date") ?? "");
  const checkInModeRaw = String(formData.get("checkInMode") ?? "BUTTON");
  const attendeeIds = formData.getAll("attendeeIds").map(String).filter(Boolean);

  if (!title) return { error: "Title is required." };
  if (typeRaw !== "MEETING" && typeRaw !== "PKS") return { error: "Select a meeting type." };
  if (!dateRaw) return { error: "Date is required." };
  if (checkInModeRaw !== "QR" && checkInModeRaw !== "BUTTON") {
    return { error: "Select a check-in mode." };
  }
  if (attendeeIds.length === 0) return { error: "Select at least one attendee." };

  const meeting = await prisma.meeting.create({
    data: {
      title,
      type: typeRaw as AttendanceType,
      date: new Date(dateRaw),
      checkInMode: checkInModeRaw as AttendanceCheckInMode,
      createdById: session.user.id,
    },
  });

  await prisma.attendanceRecord.createMany({
    data: attendeeIds.map((agentId) => ({
      meetingId: meeting.id,
      agentId,
      status: AttendanceStatus.UPCOMING,
    })),
  });

  revalidatePath("/portal/attendance");
  revalidatePath("/portal");

  return { success: true };
}

/** Admin-only: manually overrides a single attendee's status for a meeting. */
export async function markAttendanceStatusAction(
  recordId: string,
  status: "ATTENDED" | "MISSED",
  _formData: FormData
): Promise<void> {
  await requireAdmin();

  const record = await prisma.attendanceRecord.update({
    where: { id: recordId },
    data: { status, checkedInAt: status === "ATTENDED" ? new Date() : null },
    select: { meetingId: true },
  });

  revalidatePath(`/portal/attendance/${record.meetingId}`);
  revalidatePath("/portal/attendance");
  revalidatePath("/portal");
}

export type CheckInResult = { error?: string; success?: boolean; meetingTitle?: string };

/**
 * Marks the current session user's own AttendanceRecord as ATTENDED. Used
 * directly (Server Component call) from the QR checkin route, and wrapped
 * by checkInButtonAction below for the agent's "Mark Attended" button.
 *
 * Does not call revalidatePath itself — it's also invoked directly during
 * the checkin route's render (a plain GET), where revalidatePath is not
 * allowed. checkInButtonAction (the form-action call site) revalidates
 * after calling this.
 */
export async function performCheckIn(meetingId: string, token?: string): Promise<CheckInResult> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in to check in." };

  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return { error: "Meeting not found." };
  if (token && meeting.checkInToken !== token) return { error: "Invalid check-in link." };

  const record = await prisma.attendanceRecord.findUnique({
    where: { meetingId_agentId: { meetingId, agentId: session.user.id } },
  });
  if (!record) return { error: "You're not on the attendee list for this meeting." };

  if (record.status !== AttendanceStatus.ATTENDED) {
    await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { status: AttendanceStatus.ATTENDED, checkedInAt: new Date() },
    });
  }

  return { success: true, meetingTitle: meeting.title };
}

/** Void-returning wrapper for plain `<form action={...}>` use (see performCheckIn for the result-returning version used by the QR checkin route). */
export async function checkInButtonAction(meetingId: string, _formData: FormData): Promise<void> {
  await performCheckIn(meetingId);
  revalidatePath("/portal/attendance");
  revalidatePath("/portal");
}
