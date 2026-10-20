/**
 * Clears submitted / generated data so the portal starts clean, while keeping
 * all settings and every real account.
 *
 *   node prisma/reset-content.mjs            # DRY RUN: only reports what it would delete
 *   node prisma/reset-content.mjs --apply    # actually deletes (one transaction)
 *
 * Removes:  every lead, job application, newsletter subscriber, notification,
 *           activity-log entry and verification token, plus all PENDING and
 *           REJECTED registrations (and anything attached to them).
 * Keeps:    ACTIVE / DEACTIVATED accounts, permissions, attendance, birthday,
 *           commission and badge settings, FAQs, and all listings / posts /
 *           testimonials / commissions you created.
 *
 * Safety (same as remove-mock-data.mjs): a dry run changes nothing; --apply
 * refuses to run unless at least one ACTIVE Administrator will remain; it aborts
 * untouched if a listing is still assigned to a registration it would delete; and
 * everything deleted is written to reset-content-backup-<timestamp>.json before
 * the transaction commits.
 */
import fs from "node:fs";
import { pathToFileURL } from "node:url";

/**
 * @param {{ query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }> }} db
 * @param {{ apply?: boolean, log?: (m: string) => void, onBeforeCommit?: (backup: Record<string, any[]>, counts: Record<string, number>) => Promise<void> | void }} opts
 */
export async function resetContent(db, { apply = false, log = console.log, onBeforeCommit } = {}) {
  const q = async (sql, params = []) => (await db.query(sql, params)).rows;
  const backup = {};
  const counts = {};

  async function step(label, table, where = "TRUE", params = []) {
    const rows = await q(`SELECT to_jsonb("${table}") AS row FROM "${table}" WHERE ${where}`, params);
    backup[label] = rows.map((r) => r.row);
    counts[label] = rows.length;
    if (apply && rows.length) await q(`DELETE FROM "${table}" WHERE ${where}`, params);
  }

  const doomed = await q(`SELECT "id","email" FROM "User" WHERE "status" IN ('PENDING','REJECTED')`);
  const doomedIds = doomed.map((u) => u.id);

  const keptAdmins = await q(
    `SELECT "email" FROM "User" WHERE "role" = 'ADMINISTRATOR' AND "status" = 'ACTIVE' AND NOT ("id" = ANY($1))`,
    [doomedIds]
  );
  if (apply && keptAdmins.length === 0) {
    throw new Error("No ACTIVE Administrator would remain. Run `npm run db:create-admin` first so you can't lock yourself out.");
  }

  const blockers = await q(`SELECT "slug","title" FROM "Property" WHERE "agentId" = ANY($1)`, [doomedIds]);
  if (blockers.length) {
    throw new Error(
      "These listings are assigned to a pending/rejected registration — re-assign them first, then re-run:\n" +
        blockers.map((b) => `  - ${b.title} (${b.slug})`).join("\n")
    );
  }

  if (apply) await q("BEGIN");
  try {
    await step("leads", "Lead");
    await step("jobApplications", "JobApplication");
    await step("newsletterSubscribers", "NewsletterSubscriber");
    await step("notifications", "Notification");
    await step("activityLog", "ActivityLogEntry");
    await step("verificationTokens", "VerificationToken");

    // Anything attached to the registrations that is about to go (most FKs are RESTRICT).
    await step("commissionRecords", "CommissionRecord", `"agentId" = ANY($1)`, [doomedIds]);
    await step("agentQuotas", "AgentQuota", `"agentId" = ANY($1)`, [doomedIds]);
    await step("agentBadges", "AgentBadge", `"agentId" = ANY($1)`, [doomedIds]);
    await step("attendanceRecords", "AttendanceRecord", `"agentId" = ANY($1)`, [doomedIds]);
    await step("birthdayReactions", "BirthdayReaction", `"userId" = ANY($1)`, [doomedIds]);
    await step("birthdayGreetings", "BirthdayGreeting", `"authorId" = ANY($1) OR "celebrantId" = ANY($1)`, [doomedIds]);
    await step("documents", "DocumentFile", `"uploadedById" = ANY($1)`, [doomedIds]);

    // Account, Session, AgentProfile, UserPermission cascade with the user.
    await step("registrations", "User", `"id" = ANY($1)`, [doomedIds]);

    if (apply && onBeforeCommit) await onBeforeCommit(backup, counts);
    if (apply) await q("COMMIT");
  } catch (err) {
    if (apply) await q("ROLLBACK");
    throw err;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  log(`${apply ? "Deleted" : "Would delete"} ${total} row(s):`);
  for (const [k, v] of Object.entries(counts)) if (v) log(`  ${String(v).padStart(4)}  ${k}`);
  log(`\nAdministrators that remain: ${keptAdmins.map((a) => a.email).join(", ") || "NONE — create one first!"}`);
  return { counts, backup, applied: apply };
}

// ── CLI ─────────────────────────────────────────────────────────────────
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { default: pg } = await import("pg");
  await import("./load-env.mjs");
  const apply = process.argv.includes("--apply");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  console.log(`Target database: ${new URL(process.env.DATABASE_URL).host}\nMode: ${apply ? "APPLY (will delete)" : "dry run (no changes)"}\n`);

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    let backupFile = null;
    const { applied } = await resetContent(client, {
      apply,
      onBeforeCommit(backup, counts) {
        if (!Object.values(counts).some(Boolean)) return;
        backupFile = `reset-content-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
        fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      },
    });
    if (backupFile) console.log(`\nBackup saved to ${backupFile} (contains personal data — keep it private, don't commit it).`);
    if (!applied) console.log("\nNothing was changed. Re-run with --apply to delete.");
  } catch (err) {
    console.error("\n" + (err instanceof Error ? err.message : err));
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
