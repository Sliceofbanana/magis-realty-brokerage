"use client";

import Image from "next/image";
import Link from "next/link";
import { FocusEvent, useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { registerAction, type ActionState } from "@/lib/actions/auth";
import { isValidEmail, MIN_PASSWORD_LENGTH, fieldStateClasses, type FieldStatus } from "@/lib/validation";

type FieldName = "name" | "email" | "password";
type FieldErrors = Partial<Record<FieldName, string | undefined>>;

function validate(field: keyof FieldErrors, value: string): string | undefined {
  const trimmed = value.trim();
  if (field === "name" && !trimmed) return "Full name is required.";
  if (field === "email") {
    if (!trimmed) return "Email address is required.";
    if (!isValidEmail(trimmed)) return "Enter a valid email address.";
  }
  if (field === "password" && value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return undefined;
}

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(registerAction, null);
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
            Join The Network
          </p>
          <h1 className="mt-2 max-w-md font-serif text-4xl font-bold leading-tight text-white">
            Request Access to the Agent Portal.
          </h1>
          <span className="mt-4 h-1 w-16 rounded bg-gold-500" />
          <p className="mt-4 max-w-sm text-sm text-white/80">
            Applications are reviewed by a Magis Realty administrator before
            portal access is granted.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-3xl font-bold text-navy-900">Request Access</h2>
          <p className="mt-2 text-sm text-gray-500">
            Submit your details below. An administrator will review your
            application before you can sign in.
          </p>

          <form action={formAction} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Dela Cruz"
                onBlur={handleBlur("name")}
                onChange={handleChange("name")}
                aria-invalid={!!errors.name}
                className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:outline-none ${fieldStateClasses(status("name"))}`}
              />
              {errors.name ? (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              ) : status("name") === "success" ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 size={12} /> Looks good
                </p>
              ) : null}
            </div>
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
                placeholder="jane@example.com"
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
              <label
                htmlFor="phone"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900"
              >
                Phone Number (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+63 917 000 0000"
                className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900"
              >
                Create Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
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

            <Button type="submit" disabled={pending || hasErrors} className="w-full">
              {pending ? "Submitting…" : "Submit Application"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already approved?{" "}
            <Link href="/login" className="font-semibold text-navy-900 hover:text-gold-600">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
