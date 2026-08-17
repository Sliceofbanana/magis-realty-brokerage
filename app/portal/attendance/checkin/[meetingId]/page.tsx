import { CheckCircle2, XCircle } from "lucide-react";
import { performCheckIn } from "@/lib/actions/attendance";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function CheckInPage({
  params,
  searchParams,
}: {
  params: Promise<{ meetingId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { meetingId } = await params;
  const { token } = await searchParams;

  const result = await performCheckIn(meetingId, token);

  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      {result.success ? (
        <>
          <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
          <h1 className="mt-4 font-serif text-2xl font-bold text-navy-900">You&rsquo;re checked in!</h1>
          <p className="mt-2 text-sm text-gray-500">{result.meetingTitle}</p>
        </>
      ) : (
        <>
          <XCircle className="mx-auto text-red-500" size={48} />
          <h1 className="mt-4 font-serif text-2xl font-bold text-navy-900">Check-in failed</h1>
          <p className="mt-2 text-sm text-gray-500">{result.error}</p>
        </>
      )}
      <Button href="/portal/attendance" variant="outline" className="mt-6">
        Back to Attendance
      </Button>
    </div>
  );
}
