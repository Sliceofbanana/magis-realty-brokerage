import { CommissionRecord } from "@/lib/types";

// Commission earnings are released in tranches rather than a single payout.
// Every metric on the dashboard widget is derived from these records — logging
// a new release automatically updates totals, percentages, and statuses.
export const commissionRecords: CommissionRecord[] = [
  {
    id: "azure-penthouse-54b",
    property: "The Azure Penthouse — Unit 54B",
    closedDate: "2023-10-06",
    earned: 480_000,
    releases: [
      { id: "rel-1020", date: "2023-10-20", amount: 240_000, note: "Tranche 1 of 2 · Bank transfer" },
      { id: "rel-1110", date: "2023-11-10", amount: 240_000, note: "Tranche 2 of 2 · Bank transfer" },
    ],
  },
  {
    id: "verdant-heights-suite",
    property: "Verdant Heights Suite",
    closedDate: "2023-10-27",
    earned: 360_000,
    releases: [
      { id: "rel-1117", date: "2023-11-17", amount: 240_000, note: "Tranche 1 of 2 · Bank transfer" },
    ],
  },
  {
    id: "nexus-center-f21",
    property: "Nexus Center — Floor 21",
    closedDate: "2023-11-14",
    earned: 360_000,
    releases: [],
  },
];
