import type { JWT } from "next-auth/jwt";
import type { PortalRole, UserStatus } from "@prisma/client";

/** The account fields a session token mirrors — always re-read from the database. */
export type AccountState = {
  role: PortalRole;
  status: UserStatus;
  photo: string | null;
  isSystemAdmin: boolean;
};

/**
 * Brings a JWT in line with the account's current database state. Returns
 * null — which ends the session — when the account is gone or no longer
 * ACTIVE, so deactivating or rejecting someone takes effect on their next
 * request instead of whenever their token happens to expire.
 */
export function applyAccountState(token: JWT, account: AccountState | null): JWT | null {
  if (!account || account.status !== "ACTIVE") return null;
  token.role = account.role;
  token.status = account.status;
  token.photo = account.photo;
  token.isSystemAdmin = account.isSystemAdmin;
  return token;
}
