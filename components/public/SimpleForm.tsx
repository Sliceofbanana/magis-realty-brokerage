"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type SubmitVariant = "primary" | "gold" | "outline" | "outline-light" | "ghost";

export type FormField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  span?: "full" | "half";
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SimpleForm({
  fields,
  submitLabel,
  submitVariant = "gold",
  successTitle = "Thank you!",
  successMessage = "We've received your message and will be in touch shortly.",
  className = "",
  action,
}: {
  fields: FormField[];
  submitLabel: string;
  submitVariant?: SubmitVariant;
  successTitle?: string;
  successMessage?: string;
  className?: string;
  /**
   * Optional real backend call. When provided, a validated submit invokes
   * this with the form's current values instead of just faking success —
   * used to wire this shared component to a real Server Action per-page
   * without changing every consumer's markup.
   */
  action?: (values: Record<string, string>) => Promise<{ error?: string } | void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    for (const field of fields) {
      const value = values[field.name]?.trim() ?? "";
      if (field.required !== false && !value) {
        nextErrors[field.name] = "This field is required.";
      } else if (field.type === "email" && value && !emailPattern.test(value)) {
        nextErrors[field.name] = "Enter a valid email address.";
      }
    }

    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    if (action) {
      setPending(true);
      const result = await action(values).catch(() => ({ error: "Something went wrong. Please try again." }));
      setPending(false);
      if (result?.error) {
        setFormError(result.error);
        return;
      }
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        role="status"
        className={`flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center ${className}`}
      >
        <CheckCircle2 className="text-emerald-600" size={36} />
        <p className="font-serif text-lg font-bold text-navy-900">{successTitle}</p>
        <p className="text-sm text-gray-600">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      {fields.map((field) => {
        const error = errors[field.name];
        const wrapperClass = field.span === "full" || field.type === "textarea" ? "sm:col-span-2" : "";
        return (
          <div key={field.name} className={wrapperClass}>
            <label
              htmlFor={field.name}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900"
            >
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                rows={4}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.name}-error` : undefined}
                className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
              />
            ) : field.type === "select" ? (
              <select
                id={field.name}
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                aria-invalid={!!error}
                className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
              >
                <option value="">Select an option</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.name}-error` : undefined}
                className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
              />
            )}
            {error && (
              <p id={`${field.name}-error`} className="mt-1 text-xs text-red-600">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {formError && (
        <p className="sm:col-span-2 text-sm text-red-600">{formError}</p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" variant={submitVariant} disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
