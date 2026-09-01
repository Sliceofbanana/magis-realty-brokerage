"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { requestPasswordResetAction, type ActionState } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestPasswordResetAction,
    null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden h-[560px] lg:block lg:h-auto">
        <Image
          src="/images/landing-page-photo.png"
          alt="A Magis Realty luxury coastal resort listing at dusk"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/70" />
        <div className="relative flex h-full flex-col justify-end p-10 xl:p-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Account Recovery
          </p>
          <h1 className="mt-2 max-w-md font-serif text-4xl font-bold leading-tight text-white">
            Regain Access to Your Portal.
          </h1>
          <span className="mt-4 h-1 w-16 rounded bg-gold-500" />
          <p className="mt-4 max-w-sm text-sm text-white/80">
            We&apos;ll email you a secure link to choose a new password.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-3xl font-bold text-navy-900">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter the email on your account and we&apos;ll send a reset link.
          </p>

          {state?.success ? (
            <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              If that email is registered, a reset link is on its way — check your inbox.
            </div>
          ) : (
            <form action={formAction} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900"
                >
                  Professional Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="agent@magisrealty.com"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>

              {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Sending…" : "Send Reset Link"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-navy-900 hover:text-gold-600">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
