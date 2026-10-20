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
/**
 * Supabase serves the same database on two ports: 5432 is the *session* pooler
 * (one Postgres connection per client, hard cap of ~15 — the cause of the
 * "max clients reached" errors) and 6543 is the *transaction* pooler, built for
 * serverless (hundreds of clients share a few connections). The runtime always
 * uses 6543; the migrate step in the build reads DATABASE_URL directly through
 * prisma.config.ts and keeps the session pooler, which DDL needs. Set
 * DB_SESSION_MODE=1 to opt out.
 */
function runtimeConnectionString(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw || process.env.DB_SESSION_MODE) return raw;
  try {
    const url = new URL(raw);
    if (url.hostname.endsWith(".pooler.supabase.com") && (url.port === "" || url.port === "5432")) {
      url.port = "6543";
      return url.toString();
    }
  } catch {
    // Not a parseable URL — let the driver report it.
  }
  return raw;
}

const adapter = new PrismaPg({
  connectionString: runtimeConnectionString(),
  max: Number(process.env.DB_POOL_MAX) || 3,
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
