import Link from "next/link";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/url";
import { PageHeader } from "@/components/portal/PageHeader";
import { AttendanceOverview } from "@/components/portal/AttendanceOverview";
import { CreateMeetingForm } from "@/components/portal/CreateMeetingForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  attendanceConfigWithTiers,
  attendanceRecordWithMeeting,
  fallbackAttendanceConfig,
  toAttendanceConfig,
  toAttendanceSessions,
} from "@/lib/adapters/attendance";
import { checkInButtonAction } from "@/lib/actions/attendance";

function formatMeetingDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const metadata = { title: "Attendance | Magis Realty & Brokerage" };
export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user) return null;

  if (session.user.role === "ADMINISTRATOR") {
    const [activeUsers, meetings] = await Promise.all([
      prisma.user.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, photo: true, role: true },
      }),
      prisma.meeting.findMany({
        orderBy: { date: "desc" },
        include: { attendanceRecords: true },
      }),
    ]);

    return (
      <div>
        <PageHeader
          title="Attendance"
          description="Create meetings and track attendance across the brokerage."
        />
        <CreateMeetingForm activeUsers={activeUsers} />

        <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="border-b border-black/5 px-6 py-4">
            <h2 className="font-serif text-lg font-bold text-navy-900">Meetings</h2>
          </div>
          {meetings.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No meetings yet.</p>
          ) : (
            <div className="divide-y divide-black/5">
              {meetings.map((m) => {
                const attended = m.attendanceRecords.filter((r) => r.status === "ATTENDED").length;
                const missed = m.attendanceRecords.filter((r) => r.status === "MISSED").length;
                const upcoming = m.attendanceRecords.filter((r) => r.status === "UPCOMING").length;
                return (
                  <Link
                    key={m.id}
                    href={`/portal/attendance/${m.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-offwhite"
                  >
                    <div>
                      <p className="font-semibold text-navy-900">{m.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatMeetingDate(m.date)} &bull; {m.type === "MEETING" ? "Meeting" : "PKS"} &bull;{" "}
                        {m.checkInMode === "QR" ? "QR check-in" : "Button check-in"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Badge tone="green">{attended} attended</Badge>
                      <Badge tone="red">{missed} missed</Badge>
                      <Badge tone="gray">{upcoming} upcoming</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Agent / Broker / Marketing view
  const [attendanceConfigRow, myRecords] = await Promise.all([
    prisma.attendanceConfig.findUnique({
      where: { id: "singleton" },
      include: attendanceConfigWithTiers,
    }),
    prisma.attendanceRecord.findMany({
      where: { agentId: session.user.id },
      include: attendanceRecordWithMeeting,
      orderBy: { meeting: { date: "desc" } },
    }),
  ]);

  const config = attendanceConfigRow ? toAttendanceConfig(attendanceConfigRow) : fallbackAttendanceConfig;
  const sessions = toAttendanceSessions(myRecords);

  const needsCheckIn = myRecords.filter((r) => r.status === "UPCOMING");
  const resolved = myRecords.filter((r) => r.status !== "UPCOMING");

  const baseUrl = await getBaseUrl();
  const checkInItems = await Promise.all(
    needsCheckIn.map(async (r) => {
      const checkinUrl = `${baseUrl}/portal/attendance/checkin/${r.meetingId}?token=${r.meeting.checkInToken}`;
      const qr = r.meeting.checkInMode === "QR" ? await QRCode.toDataURL(checkinUrl) : null;
      return { record: r, checkinUrl, qr };
    })
  );

  return (
    <div>
      <PageHeader title="Attendance" description="Your meetings and check-in history." />
      <AttendanceOverview sessions={sessions} config={config} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-navy-900">Needs Check-in</h2>
          {checkInItems.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">Nothing to check in to right now.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {checkInItems.map(({ record: r, checkinUrl, qr }) => (
                <li key={r.id} className="rounded-xl border border-black/5 p-4">
                  <p className="font-semibold text-navy-900">{r.meeting.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatMeetingDate(r.meeting.date)} &bull; {r.meeting.type === "MEETING" ? "Meeting" : "PKS"}
                  </p>
                  {r.meeting.checkInMode === "BUTTON" ? (
                    <form action={checkInButtonAction.bind(null, r.meetingId)} className="mt-3">
                      <Button type="submit" size="sm">
                        Mark Attended
                      </Button>
                    </form>
                  ) : (
                    <div className="mt-3 flex items-center gap-4">
                      {qr && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qr} alt="Check-in QR code" width={120} height={120} className="rounded-lg border border-black/5" />
                      )}
                      <a
                        href={checkinUrl}
                        className="text-xs font-semibold text-navy-900 underline hover:text-gold-600"
                      >
                        Open check-in link
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-navy-900">History</h2>
          {resolved.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No past meetings yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {resolved.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-navy-900">{r.meeting.title}</p>
                    <p className="text-xs text-gray-400">{formatMeetingDate(r.meeting.date)}</p>
                  </div>
                  <Badge tone={r.status === "ATTENDED" ? "green" : "red"}>
                    {r.status === "ATTENDED" ? "Attended" : "Missed"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
