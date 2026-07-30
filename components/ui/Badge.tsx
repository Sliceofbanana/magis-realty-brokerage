import { ReactNode } from "react";

type Tone = "navy" | "gold" | "green" | "blue" | "gray" | "red" | "outline";

const toneClasses: Record<Tone, string> = {
  navy: "bg-navy-900 text-white",
  gold: "bg-gold-100 text-gold-600",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-sky-100 text-navy-700",
  gray: "bg-gray-100 text-gray-600",
  red: "bg-red-100 text-red-600",
  outline: "border border-current",
};

export function Badge({
  children,
  tone = "gray",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
