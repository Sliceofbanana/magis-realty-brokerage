import { ReactNode } from "react";
import { RevealOnScroll } from "./RevealOnScroll";

/** Shared eyebrow + serif heading pattern used across public marketing sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  light?: boolean;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  const containerClass =
    align === "center"
      ? "flex flex-col items-center gap-4 text-center"
      : "flex flex-wrap items-end justify-between gap-4";
  const descriptionAlign = align === "center" ? "mx-auto" : "";

  return (
    <RevealOnScroll className={containerClass}>
      <div>
        {eyebrow && (
          <p
            className={`text-xs font-semibold uppercase tracking-widest ${
              light ? "text-gold-400" : "text-gold-600"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={`mt-2 font-serif text-4xl font-bold leading-tight sm:text-5xl ${light ? "text-white" : "text-navy-900"}`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-2 max-w-md text-sm ${descriptionAlign} ${light ? "text-white/70" : "text-gray-500"}`}>
            {description}
          </p>
        )}
      </div>
      {action}
    </RevealOnScroll>
  );
}
