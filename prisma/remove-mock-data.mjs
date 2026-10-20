/**
 * Removes the sample ("mock") rows the old seed script put into a database —
 * the demo people, listings, leads, posts, testimonials, quotas, attendance
 * sessions and activity — while leaving everything real untouched.
 *
 *   node prisma/remove-mock-data.mjs            # DRY RUN: only reports what it would delete
 *   node prisma/remove-mock-data.mjs --apply    # actually deletes (one transaction)
 *
 * Options:
 *   --include-test-leads   also remove leads whose name contains "test"
 *                          (e.g. "Consultation Test Client" from form testing)
 *
 * Safety:
 *  - Rows are matched by the exact identifiers the old seed used (emails,
 *    slugs, titles) — nothing is matched by pattern except --include-test-leads.
 *  - Refuses to --apply unless at least one real (non-demo) ACTIVE
 *    Administrator exists, so you can't lock yourself out. Run
 *    `npm run db:create-admin` first.
 *  - Aborts, changing nothing, if a real listing is still assigned to a demo
 *    agent (re-assign it first).
 *  - Everything it deletes is saved to mock-data-backup-<timestamp>.json
 *    before the transaction commits.
 *
 * Uses DATABASE_URL from the environment / .env — point it at the database you
 * mean to clean.
 */
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export const MOCK = {
  userEmails: [
    "agent.smith@magisrealty.com",
    "david.chen@magisrealty.com",
    "isabella.ross@magisrealty.com",
    "julian.vancore@magisrealty.com",
    "julianna@magisrealty.com",
    "lana@magisrealty.com",
    "ramon.delacruz@magisrealty.com",
    "sarah.jenkins@magisrealty.com",
    "sarah.m@magisrealty.com",
    "sterling.a@magisrealty.com",
    "thomas.wright@magisrealty.com",
  ],
  propertySlugs: [
    "alabang-heights",
    "azure-bay-residence",
    "azure-penthouse-skyview-tower",
    "meridian-penthouse",
    "nexus-center-makati",
    "palawan-estate",
    "skyline-penthouse-bgc",
    "verdant-heights-suite",
  ],
  blogSlugs: [
    "sustainable-investing-green-architecture",
    "why-bgc-remains-the-gold-standard",
    "rebirth-of-modern-heritage-old-manila",
    "top-5-luxury-amenity-trends-2025",
    "maximizing-roi-coastal-developments",
    "new-minimalism-luxury-interiors",
    "metro-growth-corridors-2025",
  ],
  testimonialNames: ["CEO, Global Tech Group", "Managing Partner, V.C. Firm", "Private Collector"],
  leadEmails: ["j.demarco@example.com", "awhittaker@corporate.com", "slansky@invest.org", "mng@relocate.net"],
  teamIds: ["vanguard", "skyline", "horizon"],
  quotaPeriodStarts: ["2023-11-20", "2023-11-01", "2023-10-01"],
  meetingTitles: [
    "Brokerage Town Hall",
    "Listing Strategy Sync",
    "PKS: AppleOne Towers Briefing",
    "PKS: Cebu Landmasters Portfolio",
    "PKS: Horizon Residences Launch",
    "PKS: Johndorf Ventures Showcase",
    "PKS: Luxury Staging Workshop",
    "PKS: Mortgage & Financing Masterclass",
    "PKS: Primary Homes Update",
    "PKS: Resort Residences Deep Dive",
    "PKS: Sterling Land Estates",
    "PKS: Vertical Villages Intro",
    "Weekly Sales Alignment",
  ],
  activityLabels: ["Sarah Vance", "John Doe", "System Auto", "Michael Aris"],
};

/**
 * @param {{ query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }> }} db  pg Client or PGlite
 * @param {{ apply?: boolean, includeTestLeads?: boolean, log?: (m: string) => void, onBeforeCommit?: (backup: Record<string, any[]>, counts: Record<string, number>) => Promise<void> | void }} opts
 * @returns {Promise<{ counts: Record<string, number>, backup: Record<string, any[]>, applied: boolean }>}
 */
export async function removeMockData(db, { apply = false, includeTestLeads = false, log = console.log, onBeforeCommit } = {}) {
  const q = async (sql, params = []) => (await db.query(sql, params)).rows;
  const backup = {};
  const counts = {};

  /** Snapshot rows (for the backup file), then delete them. Dry-run only counts. */
  async function step(label, table, where, params) {
    const rows = await q(`SELECT to_jsonb("${table}") AS row FROM "${table}" WHERE ${where}`, params);
    backup[label] = rows.map((r) => r.row);
    counts[label] = rows.length;
    if (apply && rows.length) await q(`DELETE FROM "${table}" WHERE ${where}`, params);
  }

  const mockUsers = await q(`SELECT "id","name","email" FROM "User" WHERE lower("email") = ANY($1)`, [MOCK.userEmails]);
  const mockUserIds = mockUsers.map((u) => u.id);
  const mockNames = [...MOCK.activityLabels, ...mockUsers.map((u) => u.name)];

  // ── Safety checks ───────────────────────────────────────────────────────
  const realAdmins = await q(
    `SELECT "email" FROM "User" WHERE "role" = 'ADMINISTRATOR' AND "status" = 'ACTIVE' AND NOT (lower("email") = ANY($1))`,
    [MOCK.userEmails]
  );
  if (apply && realAdmins.length === 0) {
    throw new Error(
      "No real ACTIVE Administrator exists besides the demo accounts. Run `npm run db:create-admin` first, so you don't lock yourself out."
    );
  }

  const blockers = await q(
    `SELECT "slug","title" FROM "Property" WHERE "agentId" = ANY($1) AND NOT ("slug" = ANY($2))`,
    [mockUserIds, MOCK.propertySlugs]
  );
  if (blockers.length) {
    throw new Error(
      "These listings are not demo data but are assigned to a demo agent — re-assign them to a real person, then re-run:\n" +
        blockers.map((b) => `  - ${b.title} (${b.slug})`).join("\n")
    );
  }

  if (apply) await q("BEGIN");
  try {
    // Dependents first (most are RESTRICT, so order matters).
    await step("commissionRecords", "CommissionRecord", `"agentId" = ANY($1)`, [mockUserIds]);
    await step("agentQuotas", "AgentQuota", `"agentId" = ANY($1)`, [mockUserIds]);
    await step("agentBadges", "AgentBadge", `"agentId" = ANY($1)`, [mockUserIds]);
    await step("attendanceRecords", "AttendanceRecord", `"agentId" = ANY($1)`, [mockUserIds]);
    await step("birthdayReactions", "BirthdayReaction", `"userId" = ANY($1)`, [mockUserIds]);
    await step("birthdayGreetings", "BirthdayGreeting", `"authorId" = ANY($1) OR "celebrantId" = ANY($1)`, [mockUserIds]);
    await step("documents", "DocumentFile", `"uploadedById" = ANY($1)`, [mockUserIds]);

    await step("properties", "Property", `"slug" = ANY($1)`, [MOCK.propertySlugs]);
    await step(
      "leads",
      "Lead",
      includeTestLeads ? `"email" = ANY($1) OR "name" ILIKE '%test%'` : `"email" = ANY($1)`,
      [MOCK.leadEmails]
    );
    await step("blogPosts", "BlogPost", `"slug" = ANY($1)`, [MOCK.blogSlugs]);
    await step("testimonials", "Testimonial", `"name" = ANY($1) AND "verified" = false`, [MOCK.testimonialNames]);

    await step("meetings", "Meeting", `"title" = ANY($1) AND "date" < '2024-01-01'`, [MOCK.meetingTitles]);
    // Only periods nobody real has a quota in (so the count is right even in a dry run).
    await step(
      "quotaPeriods",
      "QuotaPeriod",
      `"start" = ANY($1::date[]) AND NOT EXISTS (SELECT 1 FROM "AgentQuota" q WHERE q."quotaPeriodId" = "QuotaPeriod"."id" AND NOT (q."agentId" = ANY($2)))`,
      [MOCK.quotaPeriodStarts, mockUserIds]
    );
    await step("activityLog", "ActivityLogEntry", `"userId" = ANY($1) OR "userLabel" = ANY($2)`, [mockUserIds, mockNames]);

    // Account, Session, AgentProfile, Notification, UserPermission cascade with the user.
    await step("users", "User", `"id" = ANY($1)`, [mockUserIds]);
    await step("leaderboardTeams", "LeaderboardTeam", `"id" = ANY($1)`, [MOCK.teamIds]);

    // Persist the backup while the delete is still uncommitted: if this throws, everything rolls back.
    if (apply && onBeforeCommit) await onBeforeCommit(backup, counts);
    if (apply) await q("COMMIT");
  } catch (err) {
    if (apply) await q("ROLLBACK");
    throw err;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  log(`${apply ? "Deleted" : "Would delete"} ${total} row(s):`);
  for (const [k, v] of Object.entries(counts)) if (v) log(`  ${String(v).padStart(4)}  ${k}`);
  if (mockUsers.length) log(`\nDemo accounts: ${mockUsers.map((u) => u.email).join(", ")}`);
  log(`Real administrators that will remain: ${realAdmins.map((a) => a.email).join(", ") || "NONE — create one first!"}`);
  return { counts, backup, applied: apply };
}

// ── CLI ─────────────────────────────────────────────────────────────────
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { default: pg } = await import("pg");
  await import("dotenv/config");
  const apply = process.argv.includes("--apply");
  const includeTestLeads = process.argv.includes("--include-test-leads");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  const host = new URL(process.env.DATABASE_URL).host;
  console.log(`Target database: ${host}\nMode: ${apply ? "APPLY (will delete)" : "dry run (no changes)"}\n`);

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    let backupFile = null;
    const { applied } = await removeMockData(client, {
      apply,
      includeTestLeads,
      onBeforeCommit(backup, counts) {
        if (!Object.values(counts).some(Boolean)) return;
        backupFile = `mock-data-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
        fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      },
    });
    if (backupFile) {
      console.log(`
Backup of deleted rows saved to ${backupFile} (contains personal data — keep it private, don't commit it).`);
    }
    if (!applied) console.log("\nNothing was changed. Re-run with --apply to delete.");
  } catch (err) {
    console.error("\n" + (err instanceof Error ? err.message : err));
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
