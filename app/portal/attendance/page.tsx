import Link from "next/link";
import QRCode from "qrcode";
import {
  CalendarCheck2,
  CalendarClock,
  GraduationCap,
  History as HistoryIcon,
  Layers,
  TrendingUp,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/url";
import { PageHeader } from "@/components/portal/PageHeader";
import { AttendanceOverview } from "@/components/portal/AttendanceOverview";
import { CreateMeetingForm } from "@/components/portal/CreateMeetingForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
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

/** Same good/fair/poor thresholds AttendanceOverview's badges imply (80%/50% split). */
function rateTone(rate: number): "green" | "gold" | "red" {
  if (rate >= 80) return "green";
  if (rate >= 50) return "gold";
  return "red";
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

    const totalAttended = meetings.reduce(
      (sum, m) => sum + m.attendanceRecords.filter((r) => r.status === "ATTENDED").length,
      0
    );
    const totalMissed = meetings.reduce(
      (sum, m) => sum + m.attendanceRecords.filter((r) => r.status === "MISSED").length,
      0
    );
    const orgRate = totalAttended + totalMissed > 0
      ? Math.round((totalAttended / (totalAttended + totalMissed)) * 100)
      : 0;

    return (
      <div>
        <PageHeader
          title="Attendance"
          description="Create meetings and track attendance across the brokerage."
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<Layers size={18} />} label="Total Sessions" value={meetings.length} iconBg="bg-sky-100 text-navy-700" />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Org Attendance Rate"
            value={`${orgRate}%`}
            iconBg="bg-gold-100 text-gold-600"
          />
          <StatCard icon={<CalendarCheck2 size={18} />} label="Total Attended" value={totalAttended} iconBg="bg-emerald-100 text-emerald-700" />
          <StatCard icon={<CalendarClock size={18} />} label="Total Missed" value={totalMissed} iconBg="bg-red-100 text-red-600" />
        </div>

        <div className="mt-6">
          <CreateMeetingForm activeUsers={activeUsers} />
        </div>

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
                const rate = attended + missed > 0 ? Math.round((attended / (attended + missed)) * 100) : null;
                return (
                  <Link
                    key={m.id}
                    href={`/portal/attendance/${m.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-offwhite"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                        {m.type === "MEETING" ? <CalendarCheck2 size={16} /> : <GraduationCap size={16} />}
                      </span>
                      <div>
                        <p className="font-semibold text-navy-900">{m.title}</p>
                        <p className="text-xs text-gray-500">
                          {formatMeetingDate(m.date)} &bull; {m.type === "MEETING" ? "Meeting" : "PKS"} &bull;{" "}
                          {m.checkInMode === "QR" ? "QR check-in" : "Button check-in"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {rate !== null && <Badge tone={rateTone(rate)}>{rate}% attended</Badge>}
                      <p className="mt-1 text-xs text-gray-400">
                        {attended} attended &bull; {missed} missed &bull; {upcoming} upcoming
                      </p>
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
            <ul className="mt-4 space-y-3">
              {checkInItems.map(({ record: r, checkinUrl, qr }) => (
                <li key={r.id} className="flex items-start gap-3 rounded-xl bg-offwhite p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                    {r.meeting.type === "MEETING" ? <CalendarCheck2 size={16} /> : <GraduationCap size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug text-navy-900">{r.meeting.title}</p>
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
                  </div>
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
              {resolved.map((r) => {
                const attended = r.status === "ATTENDED";
                return (
                  <li key={r.id} className="flex items-center gap-3 rounded-xl bg-offwhite p-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        attended ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-500"
                      }`}
                    >
                      <HistoryIcon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-navy-900">{r.meeting.title}</p>
                      <p className="text-xs text-gray-400">{formatMeetingDate(r.meeting.date)}</p>
                    </div>
                    <Badge tone={attended ? "green" : "red"}>{attended ? "Attended" : "Missed"}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
