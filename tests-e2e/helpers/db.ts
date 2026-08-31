import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Standalone Prisma client for E2E test setup/verification/teardown —
// separate from lib/prisma.ts's Next.js-request-scoped singleton, since
// these tests run outside the Next.js process entirely.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const db = new PrismaClient({ adapter });
