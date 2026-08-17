import type { Prisma } from "@prisma/client";
import type { FaqCategory } from "@/lib/types";

export const faqCategoryWithItems = {
  items: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.FaqCategoryInclude;

type FaqCategoryWithItems = Prisma.FaqCategoryGetPayload<{ include: typeof faqCategoryWithItems }>;

/** Maps a Prisma FaqCategory row to the shared front-end `FaqCategory` shape. */
export function toFaqCategory(c: FaqCategoryWithItems): FaqCategory {
  return {
    id: c.slug,
    label: c.label,
    icon: c.icon ?? "",
    items: c.items.map((i) => ({ question: i.question, answer: i.answer })),
  };
}
