/**
 * Loads environment files for the admin scripts, in the same order Next.js
 * does: real environment variables win, then .env.production.local, then
 * .env.local (where `vercel env pull` writes), then .env.
 *
 * Plain `import "dotenv/config"` only reads .env — so a database address pulled
 * into .env.local was silently ignored and the script hit whatever .env pointed
 * at (usually the local dev database).
 */
import dotenv from "dotenv";

const explicit = process.argv.find((a) => a.startsWith("--env="))?.slice("--env=".length);
for (const file of [explicit, ".env.production.local", ".env.local", ".env"].filter(Boolean)) {
  dotenv.config({ path: file, quiet: true });
}
