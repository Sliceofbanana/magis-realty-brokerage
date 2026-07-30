import { TeamMember, BirthdayConfig } from "@/lib/types";
import { portraits } from "@/lib/stockPhotos";

// Birthdates are compared by month/day only. Two members share today's date
// on purpose so the "multiple celebrants" flow (banner list, widget) is
// demonstrable without waiting a year — everyone else falls on other days.
export const team: TeamMember[] = [
  {
    id: "agent-smith",
    name: "Agent Smith",
    position: "Senior Portfolio Manager",
    photo: portraits.manCasualBeardedGlasses,
    birthDate: "1990-07-30",
    role: "Agent",
    isYou: true,
  },
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    position: "Residential Broker",
    photo: portraits.womanSmilingCasual,
    birthDate: "1988-07-30",
    role: "Broker",
  },
  {
    id: "marcus-thorne",
    name: "Marcus Thorne",
    position: "Commercial & Investment Broker",
    photo: portraits.manGlassesProfessional,
    birthDate: "1985-03-14",
    role: "Agent",
  },
  {
    id: "elena-rodriguez",
    name: "Elena Rodriguez",
    position: "Luxury Residential Broker",
    photo: portraits.womanLaughingRed,
    birthDate: "1992-11-02",
    role: "Agent",
  },
  {
    id: "david-chen",
    name: "David Chen",
    position: "Marketing Lead",
    photo: portraits.manCleanCutGray,
    birthDate: "1987-01-19",
    role: "Marketing",
  },
  {
    id: "julianna-de-marko",
    name: "Julianna De-Marko",
    position: "Administrator",
    photo: portraits.womanStripedBlazer,
    birthDate: "1983-09-05",
    role: "Administrator",
  },
];

export const defaultBirthdayConfig: BirthdayConfig = {
  enabled: true,
  messageTemplate:
    "Wishing you a wonderful birthday filled with happiness, success, and countless blessings. Thank you for being a valued member of the team. Have an amazing day and enjoy your celebration!",
  confettiEnabled: true,
  greetingsEnabled: true,
  rewardsEnabled: true,
  rewardMessage: "Enjoy a ₱1,000 birthday treat voucher, redeemable at the front desk.",
  notifyRoles: ["Administrator", "Broker", "Agent", "Marketing"],
};
