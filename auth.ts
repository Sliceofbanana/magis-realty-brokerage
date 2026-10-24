import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { PortalRole, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyPasswordUniform } from "@/lib/password";
import { checkRateLimit } from "@/lib/rateLimit";
import { needsEmailVerification } from "@/lib/emailVerification";
import { applyAccountState, type AccountState } from "@/lib/sessionRefresh";

/** How long one server instance may reuse an account lookup — bounds how stale a revoked session can be. */
const ACCOUNT_CACHE_MS = 15_000;
const accountCache = new Map<string, { at: number; state: AccountState | null }>();

async function loadAccountState(userId: string): Promise<AccountState | null> {
  const hit = accountCache.get(userId);
  if (hit && Date.now() - hit.at < ACCOUNT_CACHE_MS) return hit.state;

  const state = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true, photo: true, isSystemAdmin: true, passwordChangedAt: true },
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
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password || password.length > 200) return null;

        // This is the real gate: Auth.js also exposes it directly at
        // /api/auth/callback/credentials, bypassing loginAction. Everything
        // loginAction enforces must therefore be enforced here too.
        const [byIp, byAccount] = await Promise.all([
          checkRateLimit("credentialsIp"),
          checkRateLimit("credentialsAccount", email),
        ]);
        if (!byIp.allowed || !byAccount.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        const valid = await verifyPasswordUniform(password, user?.passwordHash);
        if (!user || !valid) return null;

        // Only ACTIVE, email-verified accounts may establish a session. The
        // login Server Action (lib/actions/auth.ts) shows a specific message for
        // these only after the password has been proven; here they simply fail closed.
        if (user.status !== "ACTIVE") return null;
        if (needsEmailVerification(user)) return null;

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
        token.authAt = Date.now(); // when this sign-in happened — see applyAccountState
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
