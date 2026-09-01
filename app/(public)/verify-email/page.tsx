import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { verifyEmailAction } from "@/lib/actions/auth";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await verifyEmailAction(token) : { error: "Missing verification token." };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        {result.success ? (
          <>
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
            <h1 className="mt-4 font-serif text-2xl font-bold text-navy-900">Email Verified</h1>
            <p className="mt-2 text-sm text-gray-500">
              Your email address is confirmed. Once an administrator approves your
              application, you&apos;ll be able to sign in.
            </p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto text-red-600" size={48} />
            <h1 className="mt-4 font-serif text-2xl font-bold text-navy-900">Verification Failed</h1>
            <p className="mt-2 text-sm text-gray-500">{result.error}</p>
          </>
        )}
        <Button href="/login" variant="outline" className="mt-8 w-full">
          Return to Sign In
        </Button>
      </div>
    </div>
  );
}
