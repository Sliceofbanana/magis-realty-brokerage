import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { PortalRole, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { applyAccountState, type AccountState } from "@/lib/sessionRefresh";

/** How long one server instance may reuse an account lookup — bounds how stale a revoked session can be. */
const ACCOUNT_CACHE_MS = 15_000;
const accountCache = new Map<string, { at: number; state: AccountState | null }>();

async function loadAccountState(userId: string): Promise<AccountState | null> {
  const hit = accountCache.get(userId);
  if (hit && Date.now() - hit.at < ACCOUNT_CACHE_MS) return hit.state;

  const state = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true, photo: true, isSystemAdmin: true },
  });
  if (accountCache.size > 500) accountCache.clear();
  accountCache.set(userId, { at: Date.now(), state });
  return state;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        // Only ACTIVE accounts may establish a session — the Odoo-style
        // PENDING/DEACTIVATED/REJECTED gate. The login Server Action
        // (lib/actions/auth.ts) checks status first and shows a specific
        // message; this is the defensive second check inside the actual
        // auth flow, so it fails closed even if that pre-check is bypassed.
        if (user.status !== "ACTIVE") return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          photo: user.photo,
          isSystemAdmin: user.isSystemAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.status = user.status;
        token.photo = user.photo;
        token.isSystemAdmin = user.isSystemAdmin;
        return token;
      }
      // The client can force a refresh (e.g. right after uploading a new
      // profile photo) — drop the cached lookup so it reads the new value.
      if (trigger === "update") accountCache.delete(token.id);
      // Every later request re-reads the account, so deactivation and role
      // changes apply within ACCOUNT_CACHE_MS instead of at token expiry.
      // Returning null ends the session.
      try {
        return applyAccountState(token, await loadAccountState(token.id));
      } catch {
        return null; // fail closed if the account can't be verified
      }
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as PortalRole;
      session.user.status = token.status as UserStatus;
      session.user.photo = token.photo as string | null;
      session.user.isSystemAdmin = token.isSystemAdmin === true;
      return session;
    },
  },
});
