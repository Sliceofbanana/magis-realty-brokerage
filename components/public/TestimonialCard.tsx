import { Star } from "lucide-react";
import { Testimonial } from "@/lib/types";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex gap-1 text-gold-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={16} className="fill-gold-500" />
        ))}
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="mt-5 border-t border-black/5 pt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">
          {testimonial.name}
        </p>
        <p className="text-xs text-gray-500">{testimonial.role}</p>
      </div>
    </div>
  );
}
