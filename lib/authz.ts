import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server-side guards for Server Actions and Server Components. These live
 * outside the "use server" action files on purpose: every export of a
 * "use server" file becomes a publicly callable endpoint.
 */

/**
 * Requires an Administrator whose account is ACTIVE *right now* — role and
 * status are read from the database, not trusted from the sign-in token.
 * Throws "Not authorized." otherwise.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized.");

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });
  if (!account || account.status !== "ACTIVE" || account.role !== "ADMINISTRATOR") {
    throw new Error("Not authorized.");
  }
  return session;
}

