import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires an explicit driver adapter — PrismaClient no longer
// reads DATABASE_URL implicitly at runtime the way earlier versions did.
//
// `max` matters a lot here: with no cap, node-postgres defaults to 10
// connections *per pool instance*, and Vercel gives each concurrent
// serverless invocation its own module scope (its own pool). A handful of
// concurrent requests can then open far more Postgres connections than
// Supabase's session-mode pooler allows (pool_size: 15 total), producing
// "max clients reached in session mode" errors. Keeping each instance's
// pool small — and releasing idle connections quickly — keeps any single
// invocation from monopolizing that shared budget.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

// Standard Next.js dev pattern: reuse one client across hot reloads instead
// of opening a fresh pool on every module re-evaluation.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
