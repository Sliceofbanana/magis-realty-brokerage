"use client";

import Image from "next/image";
import Link from "next/link";
import { FocusEvent, useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { loginAction, demoLoginAction, type ActionState } from "@/lib/actions/auth";
import { isValidEmail, fieldStateClasses, type FieldStatus } from "@/lib/validation";

const isDev = process.env.NODE_ENV !== "production";

type FieldName = "email" | "password";
type FieldErrors = Partial<Record<FieldName, string | undefined>>;

function validate(field: keyof FieldErrors, value: string): string | undefined {
  if (field === "email") {
    if (!value.trim()) return "Email address is required.";
    if (!isValidEmail(value.trim())) return "Enter a valid email address.";
  }
  if (field === "password" && !value) return "Password is required.";
  return undefined;
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, null);
  const [demoState, demoAction, demoPending] = useActionState<ActionState, FormData>(
    () => demoLoginAction(),
    null
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  function handleBlur(field: FieldName) {
    return (e: FocusEvent<HTMLInputElement>) => {
      setErrors((prev) => ({ ...prev, [field]: validate(field, e.target.value) }));
      setTouched((prev) => ({ ...prev, [field]: true }));
    };
  }

  function handleChange(field: FieldName) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: validate(field, e.target.value) }));
      }
    };
  }

  function status(field: FieldName): FieldStatus {
    if (!touched[field]) return "neutral";
    return errors[field] ? "error" : "success";
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
            The Agent Portal
          </p>
          <h1 className="mt-2 max-w-md font-serif text-4xl font-bold leading-tight text-white">
            Empowering Excellence in Elite Real Estate.
          </h1>
          <span className="mt-4 h-1 w-16 rounded bg-gold-500" />
          <p className="mt-4 max-w-sm text-sm text-white/80">
            Access your portfolio, client leads, and market analytics through
            our proprietary brokerage interface.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-3xl font-bold text-navy-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-500">
            Please enter your credentials to access the portal.
          </p>

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
                onBlur={handleBlur("email")}
                onChange={handleChange("email")}
                aria-invalid={!!errors.email}
                className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:outline-none ${fieldStateClasses(status("email"))}`}
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              ) : status("email") === "success" ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 size={12} /> Looks good
                </p>
              ) : null}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900"
                >
                  Security Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-navy-900 hover:text-gold-600">
                  Forgot Password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                onBlur={handleBlur("password")}
                onChange={handleChange("password")}
                aria-invalid={!!errors.password}
                className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:outline-none ${fieldStateClasses(status("password"))}`}
              />
              {errors.password ? (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              ) : status("password") === "success" ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 size={12} /> Looks good
                </p>
              ) : null}
            </div>

            {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-navy-900" />
              Remember this device
            </label>

            <Button type="submit" disabled={pending || hasErrors} className="w-full">
              {pending ? "Signing In…" : "Enter Portal"}
            </Button>
          </form>

          {isDev && (
            <>
              <div className="my-6 border-t border-black/10" />
              <form action={demoAction}>
                <Button type="submit" variant="outline" disabled={demoPending} className="w-full">
                  {demoPending ? "Signing In…" : "Skip Login (Demo)"}
                </Button>
              </form>
              {demoState?.error && (
                <p className="mt-2 text-center text-xs text-red-600">{demoState.error}</p>
              )}
              <p className="mt-2 text-center text-[11px] text-gray-400">
                Signs in as the seeded demo agent. Dev builds only.
              </p>
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            New to the network?{" "}
            <Link href="/register" className="font-semibold text-navy-900 hover:text-gold-600">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
