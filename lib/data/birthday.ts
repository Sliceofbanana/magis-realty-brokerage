import { BirthdayConfig } from "@/lib/types";

/** Default birthday-celebration settings, used until an administrator edits them in Settings. */
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
