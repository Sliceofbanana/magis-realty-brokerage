import crypto from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

let dummyHash: Promise<string> | null = null;

/**
 * Like verifyPassword, but takes the same time whether or not the account
 * exists (or has a password): an unknown email is compared against a throwaway
 * hash, so response time can't be used to tell which addresses are registered.
 * Returns false when there was no real hash to match.
 */
export async function verifyPasswordUniform(plain: string, hash: string | null | undefined): Promise<boolean> {
  const target = hash ?? (await (dummyHash ??= bcrypt.hash(crypto.randomUUID(), SALT_ROUNDS)));
  const matches = await bcrypt.compare(plain, target);
  return Boolean(hash) && matches;
}
