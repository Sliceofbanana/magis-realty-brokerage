/**
 * Creates (or promotes) an Administrator account.
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' npm run db:create-admin
 *
 * The credentials are read from the environment on purpose — never hard-code a
 * password in the repo. Safe to re-run: if the email already exists the account
 * is made an active, verified Administrator and its password is reset.
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (optionally ADMIN_NAME).");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMINISTRATOR", status: "ACTIVE", emailVerified: new Date(), passwordHash },
    create: { email, name, role: "ADMINISTRATOR", status: "ACTIVE", emailVerified: new Date(), passwordHash },
    select: { id: true, email: true, role: true, status: true },
  });

  console.log(`Administrator ready: ${user.email} (${user.role}, ${user.status})`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
