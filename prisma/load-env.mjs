/**
 * Loads environment files for the admin scripts. Precedence: variables already
 * set in the shell, then .env.production.local, .env.local, .env — and
 * `--env=<file>` first of all.
 *
 * Blank values are ignored. Vercel never returns "sensitive" variables such as
 * DATABASE_URL on `vercel env pull` — they come back as `KEY=""` — and a blank
 * must not shadow a real value from a lower-priority file or the shell.
 */
import fs from "node:fs";
import dotenv from "dotenv";

const explicit = process.argv.find((a) => a.startsWith("--env="))?.slice("--env=".length);
for (const file of [explicit, ".env.production.local", ".env.local", ".env"].filter(Boolean)) {
  if (!fs.existsSync(file)) continue;
  for (const [key, value] of Object.entries(dotenv.parse(fs.readFileSync(file)))) {
    if (value !== "" && !process.env[key]) process.env[key] = value;
  }
}
