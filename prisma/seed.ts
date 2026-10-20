/**
 * Bootstraps a fresh database with the settings the portal needs to run —
 * and nothing else. No people, listings, leads, posts, commissions, or other
 * sample content: everything the site shows comes from real records created
 * through the portal.
 *
 * Idempotent and non-destructive: rows that already exist are left exactly as
 * they are, so re-running this never overwrites anything an administrator has
 * changed. To create the first administrator, run `npm run db:create-admin`.
 */
import "dotenv/config";
import { PortalRole, BadgeType, PermissionKey, AttendancePeriod } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { permissionDefs, defaultRolePermissions } from "../lib/data/permissions";
import { defaultBirthdayConfig } from "../lib/data/birthday";
import { computePeriodBounds } from "../lib/attendance";
import { faqCategories } from "../lib/data/faqs";

const toPermissionEnum = (key: string) => key.replace(/-/g, "_").toUpperCase() as PermissionKey;

/** Role → permission defaults. Missing rows are created; existing ones are never touched. */
async function seedRolePermissions() {
  for (const [roleName, granted] of Object.entries(defaultRolePermissions)) {
    const role = roleName.toUpperCase() as PortalRole;
    for (const def of permissionDefs) {
      await prisma.rolePermission.upsert({
        where: { role_permission: { role, permission: toPermissionEnum(def.key) } },
        update: {},
        create: { role, permission: toPermissionEnum(def.key), granted: granted.includes(def.key) },
      });
    }
  }
}

/** Default attendance rules for the current quarter (editable in Settings). */
async function seedAttendanceConfig() {
  if (await prisma.attendanceConfig.findUnique({ where: { id: "singleton" } })) return;
  const bounds = computePeriodBounds("quarterly");
  await prisma.attendanceConfig.create({
    data: {
      id: "singleton",
      period: "QUARTERLY" as AttendancePeriod,
      periodLabel: bounds.periodLabel,
      periodStart: new Date(bounds.periodStart),
      asOf: new Date(bounds.asOf),
      pointsPerMeeting: 2,
      pointsPerPks: 4,
      eligibilityMinRate: 75,
      rewardTiers: {
        create: [
          { points: 25, label: "Bronze" },
          { points: 50, label: "Silver" },
          { points: 75, label: "Gold" },
        ],
      },
    },
  });
}

async function seedBirthdayConfig() {
  await prisma.birthdayConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      enabled: defaultBirthdayConfig.enabled,
      messageTemplate: defaultBirthdayConfig.messageTemplate,
      confettiEnabled: defaultBirthdayConfig.confettiEnabled,
      greetingsEnabled: defaultBirthdayConfig.greetingsEnabled,
      rewardsEnabled: defaultBirthdayConfig.rewardsEnabled,
      rewardMessage: defaultBirthdayConfig.rewardMessage,
      notifyRoles: defaultBirthdayConfig.notifyRoles.map((r) => r.toUpperCase() as PortalRole),
    },
  });
}

/** Badge definitions (the catalogue only — nobody is awarded anything). */
async function seedBadgeCatalogue() {
  const definitions: { type: BadgeType; label: string; description: string; icon: string }[] = [
    { type: "SALES_OF_THE_MONTH", label: "Sales of the Month", description: "Highest closed sales volume in the calendar month.", icon: "trophy" },
    { type: "ELITE_SELLER", label: "Elite Seller", description: "Sustained top-tier performance across multiple quarters.", icon: "gem" },
    { type: "VOLUME_LEADER", label: "Volume Leader", description: "Highest total transaction volume on the team.", icon: "trending-up" },
    { type: "FIRST_SALE", label: "First Sale", description: "Closed their first deal with Magis Realty.", icon: "sparkles" },
    { type: "THREE_MONTH_STREAK", label: "3-Month Streak", description: "Hit quota three months in a row.", icon: "flame" },
  ];
  for (const def of definitions) {
    await prisma.badge.upsert({ where: { type: def.type }, update: {}, create: def });
  }
}

/** The public FAQ page copy — only seeded when there are no FAQs yet. */
async function seedFaqs() {
  if ((await prisma.faqCategory.count()) > 0) return;
  for (const cat of faqCategories) {
    await prisma.faqCategory.create({
      data: {
        slug: cat.id,
        label: cat.label,
        icon: cat.icon,
        items: { create: cat.items.map((item, i) => ({ question: item.question, answer: item.answer, sortOrder: i })) },
      },
    });
  }
}

async function main() {
  console.log("Seeding role permissions…");
  await seedRolePermissions();
  console.log("Seeding attendance rules…");
  await seedAttendanceConfig();
  console.log("Seeding birthday settings…");
  await seedBirthdayConfig();
  console.log("Seeding badge catalogue…");
  await seedBadgeCatalogue();
  console.log("Seeding FAQs…");
  await seedFaqs();
  console.log("Seed complete. Create the first administrator with: npm run db:create-admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
