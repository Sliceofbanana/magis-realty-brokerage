"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

/** Subtle fade + rise-in on scroll, plays once. */
export function RevealOnScroll({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Wraps a grid so each child fades/rises in slightly after the previous one. */
export function RevealStagger({
  children,
  className = "",
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Wrapper for one grid/flex cell inside a RevealStagger. Defaults to
 * `grid h-full` rather than no layout classes at all: a plain `<div>` here
 * would stop CSS Grid/Flexbox from "blockifying" an inline child (e.g. a
 * bare `<a>` relying on `h-full`/`w-full` that only worked because it used
 * to be a *direct* grid/flex item) — the child would silently collapse to
 * 0x0. Making this wrapper itself a single-cell grid restores that
 * blockification for whatever's inside it, regardless of nesting depth.
 */
export function RevealItem({ children, className = "grid h-full" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
