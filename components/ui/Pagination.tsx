"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    0,
    5
  );

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-navy-900 disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
            p === page
              ? "bg-navy-900 text-white"
              : "text-navy-900 hover:bg-navy-900/5"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-navy-900 disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
