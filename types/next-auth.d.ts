import { PortalRole, UserStatus } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: PortalRole;
    status: UserStatus;
    photo?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: PortalRole;
      status: UserStatus;
      photo?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: PortalRole;
    status: UserStatus;
    photo?: string | null;
  }
}
