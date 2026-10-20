/**
 * Creates (or promotes) an Administrator account, then proves it works by
 * reading it back and checking the password against the stored hash.
 *
 *   npm run db:create-admin -- --email you@example.com --password 'your-password'
 *
 * (or set ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME in the environment).
 * Passing arguments works the same in PowerShell, cmd and bash — inline
 * `VAR=value command` does not work in PowerShell.
 *
 * Reads DATABASE_URL from the environment, .env.production.local, .env.local
 * or .env (in that order) and prints which database host it used — check that
 * it is your production database, not localhost. Use --env=<file> to point at a
 * specific env file. Safe to re-run: an existing account with this email is made
 * an active, verified Administrator and its password is reset.
 */
import "./load-env.mjs";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

async function main() {
  const email = (arg("email") ?? process.env.ADMIN_EMAIL)?.trim().toLowerCase();
  const password = arg("password") ?? process.env.ADMIN_PASSWORD;
  const name = (arg("name") ?? process.env.ADMIN_NAME)?.trim() || "Administrator";

  if (!email || !password) {
    throw new Error("Provide --email and --password (or ADMIN_EMAIL and ADMIN_PASSWORD).");
  }
  if (password.length < 12) {
    throw new Error("The password must be at least 12 characters.");
  }

  const host = (() => {
    try {
      return new URL(process.env.DATABASE_URL ?? "").host;
    } catch {
      return "";
    }
  })();
  if (!host) throw new Error("DATABASE_URL is not set — pull it with: vercel env pull .env.local --environment=production");
  console.log(`Target database: ${host}`);
  if (/^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host)) {
    console.warn("WARNING: this is a LOCAL database, not production. The live site will not see this account.");
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMINISTRATOR", status: "ACTIVE", emailVerified: new Date(), passwordHash },
    create: { email, name, role: "ADMINISTRATOR", status: "ACTIVE", emailVerified: new Date(), passwordHash },
  });

  // Read it back from the database and test the password the way the login does.
  const saved = await prisma.user.findUnique({
    where: { email },
    select: { email: true, role: true, status: true, emailVerified: true, passwordHash: true },
  });
  const passwordWorks = !!saved?.passwordHash && (await verifyPassword(password, saved.passwordHash));
  const ok = !!saved && saved.role === "ADMINISTRATOR" && saved.status === "ACTIVE" && !!saved.emailVerified && passwordWorks;

  console.log(
    `Account: ${saved?.email} | role ${saved?.role} | status ${saved?.status} | email verified ${!!saved?.emailVerified} | password check ${passwordWorks ? "OK" : "FAILED"}`
  );
  if (!ok) throw new Error("The account was written but did not pass verification.");
  console.log(`Done. Log in at the live site's /login with ${email}.`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
