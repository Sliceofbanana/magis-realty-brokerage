import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/url";
import { PageHeader } from "@/components/portal/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { markAttendanceStatusAction } from "@/lib/actions/attendance";

export const dynamic = "force-dynamic";

const statusTone = { ATTENDED: "green", MISSED: "red", UPCOMING: "gray" } as const;
const statusLabel = { ATTENDED: "Attended", MISSED: "Missed", UPCOMING: "Upcoming" } as const;

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMINISTRATOR") redirect("/portal/attendance");

  const { meetingId } = await params;
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      attendanceRecords: {
        include: { agent: { select: { id: true, name: true, photo: true, email: true } } },
        orderBy: { agent: { name: "asc" } },
      },
    },
  });
  if (!meeting) notFound();

  let qr: string | null = null;
  if (meeting.checkInMode === "QR") {
    const baseUrl = await getBaseUrl();
    const checkinUrl = `${baseUrl}/portal/attendance/checkin/${meeting.id}?token=${meeting.checkInToken}`;
    qr = await QRCode.toDataURL(checkinUrl, { width: 240 });
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Attendance"
        title={meeting.title}
        description={`${meeting.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · ${meeting.type === "MEETING" ? "Meeting" : "PKS Session"}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="border-b border-black/5 px-6 py-4">
            <h2 className="font-serif text-lg font-bold text-navy-900">Roster</h2>
          </div>
          {meeting.attendanceRecords.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No attendees invited.</p>
          ) : (
            <div className="divide-y divide-black/5">
              {meeting.attendanceRecords.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={r.agent.photo ?? undefined} name={r.agent.name} size={36} />
                    <div>
                      <p className="font-semibold text-navy-900">{r.agent.name}</p>
                      <p className="text-xs text-gray-500">{r.agent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
                    <form action={markAttendanceStatusAction.bind(null, r.id, "ATTENDED")}>
                      <Button type="submit" size="sm" variant={r.status === "ATTENDED" ? "primary" : "outline"}>
                        Attended
                      </Button>
                    </form>
                    <form action={markAttendanceStatusAction.bind(null, r.id, "MISSED")}>
                      <Button type="submit" size="sm" variant={r.status === "MISSED" ? "primary" : "outline"}>
                        Missed
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {qr && (
          <div className="h-fit rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm">
            <h2 className="font-serif text-lg font-bold text-navy-900">Check-in QR</h2>
            <p className="mt-1 text-xs text-gray-500">
              Display this at the meeting — agents scan it with their phone to check in.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Meeting check-in QR code" className="mx-auto mt-4 h-60 w-60" />
          </div>
        )}
      </div>
    </div>
  );
}
