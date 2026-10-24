import { PortalRole, UserStatus } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: PortalRole;
    status: UserStatus;
    photo?: string | null;
    isSystemAdmin?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: PortalRole;
      status: UserStatus;
      photo?: string | null;
      isSystemAdmin?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: PortalRole;
    status: UserStatus;
    photo?: string | null;
    isSystemAdmin?: boolean;
    /** Epoch ms of the sign-in that created this token. */
    authAt?: number;
  }
}
