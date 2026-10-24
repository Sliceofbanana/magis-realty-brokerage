import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// The suite creates and deletes accounts and records, so it must only ever
// run against a local database.
const url = process.env.DATABASE_URL ?? "";
let host = "";
try {
  host = new URL(url).hostname;
} catch {
  // handled below
}
if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) {
  throw new Error("E2E tests only run against a local DATABASE_URL (localhost / 127.0.0.1).");
}

// Standalone Prisma client for E2E test setup/verification/teardown —
// separate from lib/prisma.ts's Next.js-request-scoped singleton, since
// these tests run outside the Next.js process entirely.
const adapter = new PrismaPg({ connectionString: url });
export const db = new PrismaClient({ adapter });
