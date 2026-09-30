/**
 * Deletes every seeded/mock person except the admin account, plus every
 * row that hangs off those people (listings, leads, commissions,
 * attendance, leaderboard quotas, badges, activity log, birthday posts).
 *
 * Usage:
 *   npx tsx scripts/purge-mock-people.ts                        (dry run)
 *   npx tsx scripts/purge-mock-people.ts --confirm              (local/dev host)
 *   npx tsx scripts/purge-mock-people.ts --confirm --production (non-local host)
 *
 * Reads DATABASE_URL from the environment (dotenv-loaded), same as
 * prisma/seed.ts — point it at whichever database you want to clean by
 * setting that env var before running.
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";

const KEEP_EMAIL = "julianna@magisrealty.com";

async function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes("--confirm");
  const production = args.includes("--production");

  const dbUrl = process.env.DATABASE_URL ?? "";
  const isLocalHost = /localhost|127\.0\.0\.1/.test(dbUrl);
  if (!isLocalHost && !production) {
    console.error(
      "DATABASE_URL does not look like a local host. Re-run with --production once you've " +
        "confirmed this is the database you mean to modify (no undo)."
    );
    process.exit(1);
  }

  const admin = await prisma.user.findUnique({ where: { email: KEEP_EMAIL } });
  if (!admin) {
    console.error(`Could not find the account to keep (${KEEP_EMAIL}) — aborting, nothing changed.`);
    process.exit(1);
  }

  const others = await prisma.user.findMany({
    where: { id: { not: admin.id } },
    select: { id: true, email: true, name: true },
  });

  console.log(`Keeping: ${admin.name} <${admin.email}>`);
  console.log(`About to delete ${others.length} account(s):`);
  for (const u of others) console.log(`  - ${u.name} <${u.email}>`);

  const otherIds = others.map((u) => u.id);

  const [propertyCount, leadCount, commissionCount, meetingCount, quotaCount] = await Promise.all([
    prisma.property.count({ where: { agentId: { in: otherIds } } }),
    prisma.lead.count(),
    prisma.commissionRecord.count({ where: { agentId: { in: otherIds } } }),
    prisma.meeting.count(),
    prisma.agentQuota.count({ where: { agentId: { in: otherIds } } }),
  ]);
  console.log(
    `Also deleting: ${propertyCount} listing(s), ${leadCount} lead(s), ${commissionCount} commission record(s), ` +
      `${meetingCount} meeting(s)/attendance row(s), ${quotaCount} quota row(s).`
  );

  if (!confirm) {
    console.log("\nDry run only — re-run with --confirm to actually delete.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Children first — most of these FKs are RESTRICT, not CASCADE.
    await tx.agentBadge.deleteMany({ where: { agentId: { in: otherIds } } });
    await tx.birthdayReaction.deleteMany({ where: { userId: { in: otherIds } } });
    await tx.birthdayGreeting.deleteMany({
      where: { OR: [{ celebrantId: { in: otherIds } }, { authorId: { in: otherIds } }] },
    });
    await tx.attendanceRecord.deleteMany({ where: { agentId: { in: otherIds } } });
    await tx.meeting.deleteMany(); // all meetings were seeded against mock agents
    await tx.commissionRelease.deleteMany({ where: { record: { agentId: { in: otherIds } } } });
    await tx.commissionRecord.deleteMany({ where: { agentId: { in: otherIds } } });
    await tx.agentQuota.deleteMany({ where: { agentId: { in: otherIds } } });
    await tx.lead.deleteMany(); // every seeded lead references mock agents/properties
    await tx.documentFile.deleteMany({ where: { uploadedById: { in: otherIds } } });
    await tx.activityLogEntry.deleteMany({ where: { userId: { in: otherIds } } });
    await tx.blogPost.updateMany({ where: { authorId: { in: otherIds } }, data: { authorId: null } });

    await tx.propertyImage.deleteMany({ where: { property: { agentId: { in: otherIds } } } });
    await tx.property.deleteMany({ where: { agentId: { in: otherIds } } });

    // User cascades AgentProfile / UserPermission / Account / Session /
    // Notification(recipient) automatically (onDelete: Cascade in schema).
    await tx.user.deleteMany({ where: { id: { in: otherIds } } });
  });

  console.log(`\nDone. ${others.length} mock account(s) and their data removed. "${admin.name}" is the only account left.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
