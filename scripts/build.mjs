/**
 * `npm run build`: apply database migrations, then build the app.
 *
 * Preview deployments (VERCEL_ENV=preview) skip the migration step. Previews are
 * built from unreviewed branches, and they commonly share the production
 * DATABASE_URL — letting any pushed branch run `prisma migrate deploy` would
 * let it change the production schema. Production (and local) builds still
 * migrate, so the schema is in place before the new code serves traffic.
 * Run `npm run db:deploy` by hand against a preview database if one is needed.
 */
import { spawnSync } from "node:child_process";

function run(command) {
  console.log(`> ${command}`);
  const result = spawnSync(command, { stdio: "inherit", shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.VERCEL_ENV === "preview") {
  console.log("Preview build: skipping `prisma migrate deploy` (previews must not change the shared database).");
} else {
  run("npx prisma migrate deploy");
}
run("npx next build");
