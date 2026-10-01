"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Testimonial } from "@/lib/types";
import { TestimonialCard } from "./TestimonialCard";

const AUTO_ADVANCE_MS = 6000;

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  function go(next: number, dir: number) {
    setDirection(dir);
    setIndex((next + testimonials.length) % testimonials.length);
  }

  useEffect(() => {
    if (paused || testimonials.length <= 1) return;
    const timer = setInterval(() => go(index + 1, 1), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [index, paused, testimonials.length]);

  if (testimonials.length === 0) return null;

  return (
    <div
      className="relative mx-auto max-w-2xl"
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
          >
            <TestimonialCard testimonial={testimonials[index]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {testimonials.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => go(index - 1, -1)}
            className="absolute left-0 top-1/2 flex h-9 w-9 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-navy-900 shadow-sm hover:bg-navy-900 hover:text-white sm:-translate-x-12"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => go(index + 1, 1)}
            className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border border-black/10 bg-white text-navy-900 shadow-sm hover:bg-navy-900 hover:text-white sm:translate-x-12"
          >
            <ChevronRight size={18} />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                aria-label={`Go to testimonial ${i + 1}`}
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
