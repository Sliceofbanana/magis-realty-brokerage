import "server-only";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export type TokenPurpose = "email-verify" | "password-reset";

/**
 * Reuses Auth.js's standard `VerificationToken` table (identifier/token/
 * expires — already migrated in, unused until now since this app runs JWT
 * sessions rather than the Prisma adapter's own email-provider flow). The
 * purpose is encoded as a prefix on `identifier` so one table safely serves
 * both email verification and password reset without a new migration.
 */
function identifierFor(purpose: TokenPurpose, email: string): string {
  return `${purpose}:${email.toLowerCase()}`;
}

/** Issues a fresh single-use token, invalidating any outstanding one of the same purpose for this email. */
export async function createToken(purpose: TokenPurpose, email: string, ttlMs: number): Promise<string> {
  const identifier = identifierFor(purpose, email);
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + ttlMs);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({ data: { identifier, token, expires } });

  return token;
}

/** Validates and consumes (deletes) a token. Returns the associated email, or null if invalid/expired/wrong purpose. */
export async function consumeToken(purpose: TokenPurpose, token: string): Promise<{ email: string } | null> {
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row) return null;

  // Always delete on the way out — a token is single-use whether it succeeds or has merely expired.
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

  if (row.expires < new Date()) return null;
  if (!row.identifier.startsWith(`${purpose}:`)) return null;

  return { email: row.identifier.slice(purpose.length + 1) };
}
