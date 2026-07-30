import { Agent, Testimonial } from "@/lib/types";
import { portraits } from "@/lib/stockPhotos";

export const agents: Agent[] = [
  {
    id: "clara-beaumont",
    slug: "clara-beaumont",
    name: "Clara Beaumont",
    title: "Senior Residential Broker",
    quote:
      "Redefining the standards of luxury real estate through precision, heritage, and an unwavering commitment to excellence.",
    photo: portraits.womanGrayBlazer,
    email: "clara.beaumont@magisrealty.com",
    phone: "+63 917 000 1234",
    yearsExperience: 12,
    propertiesSoldValue: "450M+",
    clientSatisfaction: "99.8%",
    bio: [
      "With over a decade of experience navigating the intricate landscape of the Philippine luxury market, Clara Beaumont has established herself as a titan in the industry. Her approach is characterized by a deep understanding of architectural significance and the nuanced requirements of high-net-worth individuals.",
      "Having successfully brokered landmark deals in Makati's Forbes Park, BGC's residential towers, and exclusive island retreats, Clara combines market intelligence with a bespoke concierge-style service. Her portfolio is a testament to her belief that luxury is not just a price point, but an uncompromising standard of living.",
    ],
    specialties: [
      {
        title: "Urban Penthouses",
        description:
          "Expertise in the most exclusive high-rise developments in Metro Manila's central business districts.",
      },
      {
        title: "Private Estates",
        description:
          "Sourcing and negotiating expansive family estates with unparalleled privacy and heritage value.",
      },
    ],
    rating: 5,
    reviews: 42,
    specialization: "Luxury Residential",
    activeListings: 14,
    topPerformer: true,
    verified: true,
  },
  {
    id: "alexander-sterling",
    slug: "alexander-sterling",
    name: "Alexander Sterling",
    title: "Senior Property Consultant",
    quote:
      "Every transaction is a partnership. I curate portfolios, not just properties, for clients who expect nothing less than excellence.",
    photo: portraits.manConfidentSuit,
    email: "alexander.sterling@magisrealty.com",
    phone: "+63 917 000 5678",
    yearsExperience: 14,
    propertiesSoldValue: "620M+",
    clientSatisfaction: "99.5%",
    bio: [
      "Alexander Sterling has spent the last fourteen years shaping the skyline conversations of Metro Manila's most ambitious buyers, from first penthouse acquisitions to multi-property portfolios.",
      "He is known for a data-driven, discreet approach — leaning on deep developer relationships to secure access to listings before they ever reach the open market.",
    ],
    specialties: [
      {
        title: "Skyline Penthouses",
        description: "A specialist in the city's tallest and most exclusive residential towers.",
      },
      {
        title: "Investment Portfolios",
        description: "Structuring multi-unit acquisitions for long-term capital appreciation.",
      },
    ],
    rating: 5,
    reviews: 38,
    specialization: "Skyline Penthouses",
    activeListings: 22,
    topPerformer: true,
    verified: true,
  },
  {
    id: "marcus-thorne",
    slug: "marcus-thorne",
    name: "Marcus Thorne",
    title: "Commercial & Investment Broker",
    quote:
      "Commercial real estate rewards patience and precision. I bring both, along with a network built over a career.",
    photo: portraits.manGlassesProfessional,
    email: "marcus.thorne@magisrealty.com",
    phone: "+63 917 000 9012",
    yearsExperience: 10,
    propertiesSoldValue: "310M+",
    clientSatisfaction: "98.9%",
    bio: [
      "Marcus Thorne leads Magis Realty's commercial desk, advising corporations and institutional investors on office, retail, and mixed-use acquisitions across Metro Manila.",
      "His negotiation-first philosophy has closed some of the district's most competitive whole-floor transactions.",
    ],
    specialties: [
      {
        title: "Whole-Floor Offices",
        description: "Advisory on headquarters-grade office acquisitions in premier CBD towers.",
      },
      {
        title: "Retail & Mixed-Use",
        description: "Sourcing high-footfall commercial assets for institutional portfolios.",
      },
    ],
    rating: 4.9,
    reviews: 27,
    specialization: "Commercial & Investment",
    activeListings: 18,
    topPerformer: true,
    verified: false,
  },
  {
    id: "elena-rodriguez",
    slug: "elena-rodriguez",
    name: "Elena Rodriguez",
    title: "Luxury Residential Broker",
    quote:
      "I treat every listing as if it were my own home — that's the standard my clients have come to expect.",
    photo: portraits.womanLaughingRed,
    email: "elena.rodriguez@magisrealty.com",
    phone: "+63 917 000 3456",
    yearsExperience: 9,
    propertiesSoldValue: "280M+",
    clientSatisfaction: "99.1%",
    bio: [
      "Elena Rodriguez brings a boutique, relationship-first approach to every engagement, specializing in family estates and second-home acquisitions across the archipelago.",
    ],
    specialties: [
      {
        title: "Island & Coastal Estates",
        description: "A trusted advisor for beachfront and resort-adjacent acquisitions.",
      },
    ],
    rating: 5,
    reviews: 31,
    specialization: "Island & Coastal Estates",
    activeListings: 11,
    topPerformer: false,
    verified: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Clara's discretion and market insight are unparalleled. She didn't just find us a house; she found us a legacy estate that perfectly matches our family's values. The entire transaction was seamless.",
    name: "CEO, Global Tech Group",
    role: "Makati Residential Acquisition",
  },
  {
    quote:
      "Her negotiation skills are masterful. In a competitive market like BGC, having Clara in your corner is the single greatest advantage a buyer could ask for. Truly exceptional service.",
    name: "Managing Partner, V.C. Firm",
    role: "Penthouse Investment Portfolio",
  },
  {
    quote:
      "Absolute professionalism. The team understood our timeline and never wasted a single showing on properties that didn't meet our criteria.",
    name: "Private Collector",
    role: "Lakeside Development",
  },
];

export function getAgentBySlug(slug: string) {
  return agents.find((a) => a.slug === slug);
}
