import { AttendanceConfig, AttendanceSession } from "@/lib/types";

// Admin-configurable rules. The dashboard derives every metric from this
// config plus the recorded sessions below — changing a threshold or point
// value here reshapes the whole widget without touching component code.
export const attendanceConfig: AttendanceConfig = {
  period: "quarterly",
  periodLabel: "Q4 2023 Cycle",
  periodStart: "2023-10-01",
  asOf: "2023-11-22",
  pointsPerMeeting: 2,
  pointsPerPks: 4,
  eligibilityMinRate: 75,
  rewardTiers: [
    { points: 25, label: "Bronze" },
    { points: 50, label: "Silver" },
    { points: 75, label: "Gold" },
  ],
};

export const attendanceSessions: AttendanceSession[] = [
  // September (previous cycle — feeds the monthly trend)
  { id: "m-0904", type: "meeting", title: "Weekly Sales Alignment", date: "2023-09-04", status: "attended" },
  { id: "p-0907", type: "pks", title: "PKS: Vertical Villages Intro", date: "2023-09-07", status: "attended" },
  { id: "m-0911", type: "meeting", title: "Weekly Sales Alignment", date: "2023-09-11", status: "attended" },
  { id: "m-0918", type: "meeting", title: "Weekly Sales Alignment", date: "2023-09-18", status: "missed" },
  { id: "p-0921", type: "pks", title: "PKS: Resort Residences Deep Dive", date: "2023-09-21", status: "missed" },
  { id: "m-0925", type: "meeting", title: "Weekly Sales Alignment", date: "2023-09-25", status: "attended" },

  // October
  { id: "m-1002", type: "meeting", title: "Weekly Sales Alignment", date: "2023-10-02", status: "attended" },
  { id: "p-1005", type: "pks", title: "PKS: Cebu Landmasters Portfolio", date: "2023-10-05", status: "attended" },
  { id: "m-1009", type: "meeting", title: "Weekly Sales Alignment", date: "2023-10-09", status: "attended" },
  { id: "m-1012", type: "meeting", title: "Brokerage Town Hall", date: "2023-10-12", status: "attended" },
  { id: "p-1013", type: "pks", title: "PKS: AppleOne Towers Briefing", date: "2023-10-13", status: "attended" },
  { id: "m-1016", type: "meeting", title: "Weekly Sales Alignment", date: "2023-10-16", status: "attended" },
  { id: "p-1019", type: "pks", title: "PKS: Primary Homes Update", date: "2023-10-19", status: "missed" },
  { id: "m-1023", type: "meeting", title: "Weekly Sales Alignment", date: "2023-10-23", status: "missed" },
  { id: "p-1026", type: "pks", title: "PKS: Sterling Land Estates", date: "2023-10-26", status: "attended" },
  { id: "m-1030", type: "meeting", title: "Weekly Sales Alignment", date: "2023-10-30", status: "attended" },

  // November
  { id: "p-1103", type: "pks", title: "PKS: Johndorf Ventures Showcase", date: "2023-11-03", status: "attended" },
  { id: "m-1106", type: "meeting", title: "Weekly Sales Alignment", date: "2023-11-06", status: "attended" },
  { id: "p-1110", type: "pks", title: "PKS: Mortgage & Financing Masterclass", date: "2023-11-10", status: "attended" },
  { id: "m-1113", type: "meeting", title: "Weekly Sales Alignment", date: "2023-11-13", status: "attended" },
  { id: "p-1116", type: "pks", title: "PKS: Luxury Staging Workshop", date: "2023-11-16", status: "attended" },
  { id: "m-1117", type: "meeting", title: "Listing Strategy Sync", date: "2023-11-17", status: "attended" },
  { id: "m-1120", type: "meeting", title: "Weekly Sales Alignment", date: "2023-11-20", status: "attended" },

  // Upcoming
  { id: "m-1124", type: "meeting", title: "Weekly Sales Alignment", date: "2023-11-24", status: "upcoming" },
  { id: "p-1128", type: "pks", title: "PKS: Horizon Residences Launch", date: "2023-11-28", status: "upcoming" },
];
