import { Star, BadgeCheck, ArrowUpRight } from "lucide-react";
import { Testimonial } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 text-gold-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} className="fill-gold-500" />
          ))}
        </div>
        {testimonial.verified && (
          <Badge tone="green" title="Confirmed as a real Magis Realty client">
            <BadgeCheck size={12} /> Verified Client
          </Badge>
        )}
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-black/5 pt-4">
        <Avatar src={testimonial.photo} name={testimonial.name} size={36} />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            {testimonial.name}
          </p>
          <p className="text-xs text-gray-500">{testimonial.role}</p>
        </div>
      </div>
      {testimonial.sourceUrl && (
        <a
          href={testimonial.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-gold-600"
        >
          Read on {testimonial.sourceLabel ?? "the original source"} <ArrowUpRight size={12} />
        </a>
      )}
    </div>
  );
}
