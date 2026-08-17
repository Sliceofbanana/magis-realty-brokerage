import { prisma } from "@/lib/prisma";
import { faqCategoryWithItems, toFaqCategory } from "@/lib/adapters/faq";
import { submitInquiryAction } from "@/lib/actions/leads";
import { FaqsView } from "@/components/public/FaqsView";

export const metadata = { title: "FAQs | Magis Realty & Brokerage" };
export const dynamic = "force-dynamic";

export default async function FaqsPage() {
  const rows = await prisma.faqCategory.findMany({ include: faqCategoryWithItems });
  const categories = rows.map(toFaqCategory);

  async function submitFaqsInquiry(values: Record<string, string>) {
    "use server";
    return submitInquiryAction({
      name: values.name,
      email: values.email,
      message: values.message,
      source: "FAQs Page",
    });
  }

  return <FaqsView categories={categories} contactAction={submitFaqsInquiry} />;
}
