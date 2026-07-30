import { BlogPost } from "@/lib/types";
import { business, exteriors, interiors } from "@/lib/stockPhotos";

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "sustainable-investing-green-architecture",
    title: "Sustainable Investing: The Rise of Green Architecture in Metro Markets",
    excerpt:
      "As the global climate conversation shifts from abstract policy to tangible urban development, the luxury real estate sector is undergoing a profound transformation.",
    category: "Investment Tips",
    author: "Julian V. Magis",
    date: "October 24, 2024",
    readTime: "8 min read",
    image: exteriors.glassOfficeTowers,
    pullQuote:
      "True luxury today is defined not by excess, but by harmony with our surroundings. Green architecture is the ultimate expression of this balance.",
    content: [
      "As the global climate conversation shifts from abstract policy to tangible urban development, the luxury real estate sector in the Philippines is undergoing a profound transformation. No longer is \"green\" a mere buzzword; it is the new benchmark for enduring value.",
      "The integration of sustainable practices in high-end developments is reshaping investor expectations. From the vertical forests of Makati to the solar-integrated estates in Cebu, green architecture is proving to be a resilient asset class. The \"green premium\" is real, with sustainable buildings commanding higher rental yields and lower vacancy rates compared to traditional structures.",
      "Investors are increasingly prioritizing developments that offer biophilic design — a concept that increases occupant connectivity to the natural environment through the use of direct nature, indirect nature, and space and place conditions.",
      "Looking forward, the rise of \"Passive House\" standards and net-zero energy buildings will likely become the standard for the Magis portfolio. As we consult with our developer partners, our focus remains on long-term capital preservation through innovative, planet-positive design.",
    ],
    tags: ["Sustainability", "Investment", "Architecture", "Metro Manila"],
  },
  {
    id: "2",
    slug: "why-bgc-remains-the-gold-standard",
    title: "Why BGC Remains the Gold Standard for Commercial Property",
    excerpt:
      "A market analysis of why Bonifacio Global City continues to command premium valuations across the commercial real estate sector.",
    category: "Market Analysis",
    author: "Julian V. Magis",
    date: "October 12, 2024",
    readTime: "6 min read",
    image: interiors.officeLounge,
    pullQuote: "Prime infrastructure and walkability continue to command a durable rental premium.",
    content: [
      "Bonifacio Global City has weathered multiple market cycles while maintaining some of the strongest occupancy rates in Metro Manila's commercial segment.",
      "Its master-planned infrastructure, pedestrian-first design, and concentration of multinational tenants continue to differentiate it from newer, less established districts.",
    ],
    tags: ["Market Analysis", "Commercial", "BGC"],
  },
  {
    id: "3",
    slug: "rebirth-of-modern-heritage-old-manila",
    title: "The Rebirth of Modern Heritage in Old Manila",
    excerpt:
      "Heritage-conscious redevelopment is reshaping how buyers think about the country's oldest neighborhoods.",
    category: "Architecture",
    author: "Julian V. Magis",
    date: "September 30, 2024",
    readTime: "5 min read",
    image: exteriors.contemporaryHouseFence,
    pullQuote: "Heritage isn't a constraint on design — it's a foundation for it.",
    content: [
      "A new generation of developers is restoring pre-war structures in Manila's historic districts, blending original facades with contemporary interiors.",
      "The result is a growing segment of buyers who want heritage character without sacrificing modern comfort.",
    ],
    tags: ["Architecture", "Heritage", "Metro Manila"],
  },
  {
    id: "4",
    slug: "top-5-luxury-amenity-trends-2025",
    title: "Top 5 Luxury Amenity Trends for 2025",
    excerpt:
      "From wellness suites to private climate-controlled cellars, here's what discerning buyers are asking for next year.",
    category: "Lifestyle",
    author: "Julian V. Magis",
    date: "September 18, 2024",
    readTime: "4 min read",
    image: interiors.coffeeJournalFlatlay,
    pullQuote: "Amenities are no longer add-ons — they're the deciding factor.",
    content: [
      "Wellness-first design, private wine storage, and full home automation top the list of amenities buyers are prioritizing heading into 2025.",
    ],
    tags: ["Lifestyle", "Trends"],
  },
  {
    id: "5",
    slug: "maximizing-roi-coastal-developments",
    title: "Maximizing ROI in Coastal Developments",
    excerpt:
      "How to identify prime beachfront properties that promise long-term appreciation.",
    category: "Strategy",
    author: "Julian V. Magis",
    date: "September 2, 2024",
    readTime: "7 min read",
    image: exteriors.resortPoolNight,
    pullQuote: "Location discipline is the single greatest predictor of coastal ROI.",
    content: [
      "Coastal developments reward buyers who prioritize access, protected coastline, and proximity to established infrastructure over raw land price.",
    ],
    tags: ["Strategy", "Coastal"],
  },
  {
    id: "6",
    slug: "new-minimalism-luxury-interiors",
    title: "The New Minimalism in Luxury Interiors",
    excerpt: "Exploring the shift toward meaningful, high-quality materials over decorative excess.",
    category: "Design",
    author: "Julian V. Magis",
    date: "August 21, 2024",
    readTime: "5 min read",
    image: interiors.brightLivingRoom,
    pullQuote: "Restraint, done well, is the most expensive design choice of all.",
    content: [
      "Buyers are increasingly favoring fewer, better materials — natural stone, unlacquered brass, and engineered timber — over ornamentation.",
    ],
    tags: ["Design", "Interiors"],
  },
  {
    id: "7",
    slug: "metro-growth-corridors-2025",
    title: "Metro Growth Corridors to Watch in 2025",
    excerpt: "Expert predictions on the next residential hotspots outside the traditional city center.",
    category: "Trend Report",
    author: "Julian V. Magis",
    date: "August 5, 2024",
    readTime: "6 min read",
    image: business.laptopOnDesk,
    pullQuote: "The next decade of growth is being built along the transit corridors, not the CBD core.",
    content: [
      "New transit infrastructure is quietly repricing residential corridors well outside the traditional central business districts.",
    ],
    tags: ["Trend Report", "Metro Manila"],
  },
];

export function getPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
