import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Application Submitted | Magis Realty & Brokerage" };

export default function RegisterSuccessPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 size={28} />
      </span>
      <h1 className="mt-6 font-serif text-3xl font-bold text-navy-900">
        Application Submitted
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-500">
        Thanks for applying to join the Magis Realty agent network. Your
        application is now pending review — an administrator will approve
        your account before you can sign in to the portal.
      </p>
      <Button href="/" variant="outline" className="mt-6">
        Back to Home
      </Button>
    </div>
  );
}
