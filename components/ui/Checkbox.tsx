"use client";

import { Check, Minus } from "lucide-react";

export type CheckState = "checked" | "unchecked" | "indeterminate";

/**
 * Tri-state checkbox. "indeterminate" (some but not all selected) shows a minus
 * sign, "checked" shows a checkmark.
 */
export function Checkbox({
  state,
  onChange,
  label,
  disabled = false,
}: {
  state: CheckState;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  const filled = state !== "unchecked";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === "indeterminate" ? "mixed" : state === "checked"}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 ${
        filled ? "border-navy-900 bg-navy-900 text-white" : "border-gray-300 bg-white hover:border-navy-900"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {state === "checked" && <Check size={14} strokeWidth={3} />}
      {state === "indeterminate" && <Minus size={14} strokeWidth={3} />}
    </button>
  );
}
