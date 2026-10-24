import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";

/**
 * Throwaway accounts the suite creates for itself (global-setup.ts) and
 * removes afterwards (global-teardown.ts), so it never depends on — or knows
 * the password of — a real account in the target database. Passwords are
 * random per run and handed to the workers through the environment.
 */
export const E2E_ADMIN_EMAIL = "e2e-admin@example.test";
export const E2E_AGENT_EMAIL = "e2e-agent@example.test";

const ACCOUNTS = [
  { email: E2E_ADMIN_EMAIL, name: "E2E Admin", role: "ADMINISTRATOR", passwordEnv: "E2E_ADMIN_PASSWORD" },
  { email: E2E_AGENT_EMAIL, name: "E2E Agent", role: "AGENT", passwordEnv: "E2E_AGENT_PASSWORD" },
] as const;

export async function createTestAccounts() {
  for (const a of ACCOUNTS) {
    const password = crypto.randomBytes(18).toString("hex");
    process.env[a.passwordEnv] = password;
    const data = {
      name: a.name,
      role: a.role,
      status: "ACTIVE" as const,
      emailVerified: new Date(),
      passwordHash: await bcrypt.hash(password, 10),
    };
    await db.user.upsert({ where: { email: a.email }, update: data, create: { email: a.email, ...data } });
  }
}

export async function deleteTestAccounts() {
  for (const a of ACCOUNTS) {
    // A failure here means a spec left records behind; surface it rather than hide it.
    await db.user.deleteMany({ where: { email: a.email } });
  }
}
