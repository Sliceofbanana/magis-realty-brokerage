import { portraits } from "@/lib/stockPhotos";

export const developerPartners = [
  { name: "Cebu Landmasters", logo: "/images/developers/cebulandmasteers.jpg" },
  { name: "Primary Homes", logo: "/images/developers/primaryhomes.jpg" },
  { name: "Sterling Land", logo: "/images/developers/sterling.jpg" },
  { name: "Johndorf Ventures", logo: "/images/developers/johndorf.jpg" },
  { name: "AppleOne Properties", logo: "/images/developers/apple-one.jpg" },
];

export const leadershipTeam = [
  { name: "Rafael V. San Juan", title: "Founder & President", photo: portraits.manGraySweater },
  { name: "Elena M. Torres", title: "Founder & President", photo: portraits.womanStripedBlazer },
  { name: "Mark Anthony Co", title: "Founder & President", photo: portraits.olderManGlasses },
  { name: "Sofia L. Reyes", title: "Founder & President", photo: portraits.womanSmilingCasual },
];

export const recentInquiries = [
  { client: "Marcus Sterling", property: "Azure Horizon Penthouse", status: "New" as const },
  { client: "Lydia Thorne", property: "Veridian Estate Villa", status: "Follow-up" as const },
  { client: "Jonathan Reed", property: "The Gilded Heights", status: "New" as const },
  { client: "Sarah Jenkins", property: "Modern Sanctuary II", status: "Nurturing" as const },
];

export const recentActivity = [
  { title: "New Lead: Sarah Johnson inquired about Oceanview Villa", time: "2 hours ago" },
  { title: "Contract Updated: Closing documents for Unit 402, Marble Tower have been revised.", time: "5 hours ago" },
  { title: "Deal Closed: Agent Smith finalized the sale of 88 Highgate Circle.", time: "Yesterday" },
];
