import { FaqCategory } from "@/lib/types";

export const faqCategories: FaqCategory[] = [
  {
    id: "buying",
    label: "Buying",
    icon: "wallet",
    items: [
      {
        question: "What are the initial steps to buying a home with Magis?",
        answer:
          "We begin with a private consultation to understand your budget, timeline, and lifestyle needs, followed by a curated shortlist of properties matched to your criteria.",
      },
      {
        question: "Does Magis handle the legal documentation?",
        answer:
          "Yes. Our in-house transaction team manages contracts, due diligence, and closing documentation from offer to title transfer.",
      },
    ],
  },
  {
    id: "selling",
    label: "Selling",
    icon: "tag",
    items: [
      {
        question: "How do you determine the market value of my property?",
        answer:
          "We combine comparable sales data, current demand signals, and an in-person valuation to arrive at a defensible, data-backed asking price.",
      },
      {
        question: "What marketing strategies do you use for listings?",
        answer:
          "Every listing receives professional photography, targeted digital campaigns, and access to our private network of qualified buyers and agents.",
      },
    ],
  },
  {
    id: "leasing",
    label: "Leasing",
    icon: "key",
    items: [
      {
        question: "What is the standard lease term?",
        answer:
          "Most residential leases run 12 months, though we can structure shorter or longer terms depending on landlord and tenant needs.",
      },
      {
        question: "How is maintenance handled?",
        answer:
          "Our property management team coordinates all maintenance requests and vets licensed contractors on the owner's behalf.",
      },
    ],
  },
  {
    id: "investment",
    label: "Investment",
    icon: "trending-up",
    items: [
      {
        question: "How does Magis identify high-yield opportunities?",
        answer:
          "Our research desk tracks rental yield, appreciation trends, and infrastructure development to surface opportunities ahead of the broader market.",
      },
    ],
  },
];
