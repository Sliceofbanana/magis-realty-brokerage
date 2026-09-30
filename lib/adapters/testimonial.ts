import type { Testimonial as TestimonialRow } from "@prisma/client";
import type { Testimonial } from "@/lib/types";

/** Maps a Prisma Testimonial row to the shared front-end `Testimonial` shape. */
export function toTestimonial(row: TestimonialRow): Testimonial {
  return {
    quote: row.quote,
    name: row.name,
    role: row.role,
    photo: row.photo ?? undefined,
    verified: row.verified,
    sourceUrl: row.sourceUrl ?? undefined,
    sourceLabel: row.sourceLabel ?? undefined,
  };
}
