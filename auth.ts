import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { PortalRole, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

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
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.photo = user.photo;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as PortalRole;
      session.user.status = token.status as UserStatus;
      session.user.photo = token.photo as string | null;
      return session;
    },
  },
});
