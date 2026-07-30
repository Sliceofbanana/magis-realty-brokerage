import { LeaderboardAgent, QuotaPeriodId } from "@/lib/types";
import { portraits } from "@/lib/stockPhotos";

export type QuotaPeriod = {
  id: QuotaPeriodId;
  label: string;
  cycleLabel: string;
  start: string;
  end: string;
  asOf: string;
};

export const quotaPeriods: QuotaPeriod[] = [
  {
    id: "weekly",
    label: "Weekly",
    cycleLabel: "Week of Nov 20 – 26, 2023",
    start: "2023-11-20",
    end: "2023-11-26",
    asOf: "2023-11-22",
  },
  {
    id: "monthly",
    label: "Monthly",
    cycleLabel: "November 2023 Cycle",
    start: "2023-11-01",
    end: "2023-11-30",
    asOf: "2023-11-22",
  },
  {
    id: "quarterly",
    label: "Quarterly",
    cycleLabel: "Q4 2023 Performance Cycle",
    start: "2023-10-01",
    end: "2023-12-31",
    asOf: "2023-11-22",
  },
];

export const leaderboardAgents: LeaderboardAgent[] = [
  {
    id: "julian-vancore",
    name: "Julian Vancore",
    photo: portraits.manSmilingWhiteShirt,
    region: "Central District",
    units: 32,
    leads: 210,
    quota: { weekly: 2_300_000, monthly: 10_000_000, quarterly: 30_000_000 },
    achieved: { weekly: 1_400_000, monthly: 10_800_000, quarterly: 24_500_000 },
  },
  {
    id: "elena-rodriguez",
    name: "Elena Rodriguez",
    photo: portraits.womanLaughingRed,
    region: "North Corridor",
    units: 27,
    leads: 188,
    quota: { weekly: 2_150_000, monthly: 9_300_000, quarterly: 28_000_000 },
    achieved: { weekly: 900_000, monthly: 7_100_000, quarterly: 18_200_000 },
  },
  {
    id: "marcus-thorne",
    name: "Marcus Thorne",
    photo: portraits.manGlassesProfessional,
    region: "Bay Area",
    units: 24,
    leads: 165,
    quota: { weekly: 2_000_000, monthly: 8_700_000, quarterly: 26_000_000 },
    achieved: { weekly: 750_000, monthly: 6_000_000, quarterly: 15_900_000 },
  },
  {
    id: "alex-sterling",
    name: "Alex Sterling",
    photo: portraits.manConfidentSuit,
    region: "Upper East Side",
    units: 24,
    leads: 142,
    isYou: true,
    quota: { weekly: 1_900_000, monthly: 8_300_000, quarterly: 25_000_000 },
    achieved: { weekly: 820_000, monthly: 4_900_000, quarterly: 14_200_000 },
  },
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    photo: portraits.womanSmilingCasual,
    region: "Downtown Hub",
    units: 21,
    leads: 118,
    quota: { weekly: 1_900_000, monthly: 8_300_000, quarterly: 25_000_000 },
    achieved: { weekly: 600_000, monthly: 5_600_000, quarterly: 13_800_000 },
  },
  {
    id: "david-chen",
    name: "David Chen",
    photo: portraits.manCleanCutGray,
    region: "Silicon Valley",
    units: 19,
    leads: 205,
    quota: { weekly: 1_850_000, monthly: 8_000_000, quarterly: 24_000_000 },
    achieved: { weekly: 400_000, monthly: 4_200_000, quarterly: 12_500_000 },
  },
  {
    id: "isabella-ross",
    name: "Isabella Ross",
    photo: portraits.womanStripedBlazer,
    region: "Chelsea District",
    units: 18,
    leads: 95,
    quota: { weekly: 1_850_000, monthly: 8_000_000, quarterly: 24_000_000 },
    achieved: { weekly: 700_000, monthly: 3_100_000, quarterly: 11_900_000 },
  },
  {
    id: "thomas-wright",
    name: "Thomas Wright",
    photo: portraits.manCasualBeardedGlasses,
    region: "Brooklyn Heights",
    units: 17,
    leads: 112,
    quota: { weekly: 2_000_000, monthly: 8_700_000, quarterly: 26_000_000 },
    achieved: { weekly: 500_000, monthly: 4_400_000, quarterly: 10_500_000 },
  },
];
