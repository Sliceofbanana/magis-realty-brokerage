"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Testimonial } from "@/lib/types";
import { TestimonialCard } from "./TestimonialCard";

const AUTO_ADVANCE_MS = 6000;

/** 1 on mobile, 2 on tablet, 3 on desktop — matches Tailwind's sm/lg breakpoints. */
function useItemsPerView() {
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const mdQuery = window.matchMedia("(min-width: 640px)");
    const lgQuery = window.matchMedia("(min-width: 1024px)");

    function update() {
      setItemsPerView(lgQuery.matches ? 3 : mdQuery.matches ? 2 : 1);
    }

    update();
    mdQuery.addEventListener("change", update);
    lgQuery.addEventListener("change", update);
    // Belt-and-suspenders: some browsers/automation contexts don't fire
    // matchMedia "change" on viewport resize, only the window "resize" event.
    window.addEventListener("resize", update);
    return () => {
      mdQuery.removeEventListener("change", update);
      lgQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return itemsPerView;
}

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const itemsPerView = useItemsPerView();
  const pages = chunk(testimonials, itemsPerView);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  // Clamp the current page if the viewport-driven page size just changed.
  useEffect(() => {
    if (index > pages.length - 1) setIndex(0);
  }, [pages.length, index]);

  function go(next: number, dir: number) {
    setDirection(dir);
    setIndex((next + pages.length) % pages.length);
  }

  useEffect(() => {
    if (paused || pages.length <= 1) return;
    const timer = setInterval(() => go(index + 1, 1), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, pages.length]);

  if (testimonials.length === 0) return null;
  const currentPage = pages[index] ?? pages[0] ?? [];

  return (
    <div
      className="relative mx-auto max-w-6xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-80 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {currentPage.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {pages.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous testimonials"
            onClick={() => go(index - 1, -1)}
            className="absolute left-0 top-1/2 flex h-9 w-9 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-navy-900 shadow-sm hover:bg-navy-900 hover:text-white sm:-translate-x-12"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next testimonials"
            onClick={() => go(index + 1, 1)}
            className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border border-black/10 bg-white text-navy-900 shadow-sm hover:bg-navy-900 hover:text-white sm:translate-x-12"
          >
            <ChevronRight size={18} />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to testimonials page ${i + 1}`}
                onClick={() => go(i, i > index ? 1 : -1)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-gold-500" : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
