"use client";

import Image from "next/image";
import Link from "next/link";
import { FocusEvent, useActionState, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { resetPasswordAction, type ResetPasswordState } from "@/lib/actions/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

type FieldErrors = { password?: string; confirmPassword?: string };

export function ResetPasswordForm({ token }: { token: string | null }) {
  const boundAction = token
    ? resetPasswordAction.bind(null, token)
    : async (): Promise<ResetPasswordState> => ({ error: "Missing reset token." });
  const [state, formAction, pending] = useActionState<ResetPasswordState, FormData>(boundAction, null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function passwordError(value: string): string | undefined {
    return value.length < MIN_PASSWORD_LENGTH
      ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      : undefined;
  }

  function confirmError(value: string, currentPassword: string): string | undefined {
    return value !== currentPassword ? "Passwords don't match." : undefined;
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setPassword(value);
    setErrors((prev) => ({
      password: prev.password ? passwordError(value) : prev.password,
      confirmPassword: prev.confirmPassword ? confirmError(confirmPassword, value) : prev.confirmPassword,
    }));
  }

  function handlePasswordBlur(e: FocusEvent<HTMLInputElement>) {
    setErrors((prev) => ({ ...prev, password: passwordError(e.target.value) }));
  }

  function handleConfirmChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError(value, password) }));
    }
  }

  function handleConfirmBlur(e: FocusEvent<HTMLInputElement>) {
    setErrors((prev) => ({ ...prev, confirmPassword: confirmError(e.target.value, password) }));
  }

  const hasErrors = Object.values(errors).some(Boolean);

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
            Choose a New Password.
          </h1>
          <span className="mt-4 h-1 w-16 rounded bg-gold-500" />
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          {state?.success ? (
            <>
              <CheckCircle2 className="text-emerald-600" size={40} />
              <h2 className="mt-4 font-serif text-3xl font-bold text-navy-900">Password Updated</h2>
              <p className="mt-2 text-sm text-gray-500">
                Your password has been changed. You can now sign in with it.
              </p>
              <Button href="/login" className="mt-8 w-full">
                Return to Sign In
              </Button>
            </>
          ) : !token ? (
            <>
              <XCircle className="text-red-600" size={40} />
              <h2 className="mt-4 font-serif text-3xl font-bold text-navy-900">Invalid Link</h2>
              <p className="mt-2 text-sm text-gray-500">
                This reset link is missing its token. Request a new one below.
              </p>
              <Button href="/forgot-password" variant="outline" className="mt-8 w-full">
                Request New Link
              </Button>
            </>
          ) : (
            <>
              <h2 className="font-serif text-3xl font-bold text-navy-900">Reset Password</h2>
              <p className="mt-2 text-sm text-gray-500">Choose a new password for your account.</p>

              <form action={formAction} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900"
                  >
                    New Password
                  </label>
                  <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    aria-invalid={!!errors.password}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900"
                  >
                    Confirm New Password
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    onChange={handleConfirmChange}
                    onBlur={handleConfirmBlur}
                    aria-invalid={!!errors.confirmPassword}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {state?.error && (
                  <p className="text-xs text-red-600">
                    {state.error}{" "}
                    {state.error.includes("invalid or has expired") && (
                      <Link href="/forgot-password" className="font-semibold underline">
                        Request a new link
                      </Link>
                    )}
                  </p>
                )}

                <Button type="submit" disabled={pending || hasErrors} className="w-full">
                  {pending ? "Updating…" : "Update Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
