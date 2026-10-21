"use client";

import type { ReactNode } from "react";

/** Shown while rows are selected: the count, the bulk actions (children), and Clear. */
export function BulkActionBar({
  count,
  onClear,
  busy = false,
  error,
  className = "",
  children,
}: {
  count: number;
  onClear: () => void;
  busy?: boolean;
  error?: string | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <>
      {count > 0 && (
        <div
          className={`flex flex-wrap items-center gap-3 bg-gold-100 px-4 py-2.5 text-sm text-navy-900 ${className}`}
        >
          <span className="font-semibold">{count} selected</span>
          {children}
          <button
            type="button"
            onClick={onClear}
            disabled={busy}
            className="text-xs font-semibold text-gray-600 hover:text-navy-900 disabled:opacity-50"
          >
            Clear selection
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className={`bg-red-50 px-4 py-2 text-xs text-red-700 ${className}`}>
          {error}
        </p>
      )}
    </>
  );
}

const toneClasses = {
  danger: "bg-red-600 hover:bg-red-700",
  neutral: "bg-navy-900 hover:bg-navy-800",
} as const;

export function BulkActionButton({
  tone = "danger",
  disabled,
  onClick,
  children,
}: {
  tone?: keyof typeof toneClasses;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}
