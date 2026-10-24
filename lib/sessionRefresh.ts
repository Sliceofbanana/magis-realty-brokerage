import type { JWT } from "next-auth/jwt";
import type { PortalRole, UserStatus } from "@prisma/client";

/** The account fields a session token mirrors — always re-read from the database. */
export type AccountState = {
  role: PortalRole;
  status: UserStatus;
  photo: string | null;
  isSystemAdmin: boolean;
  /** When the password was last changed or reset, if ever. */
  passwordChangedAt: Date | null;
};

/**
 * Brings a JWT in line with the account's current database state. Returns
 * null — which ends the session — when the account is gone or no longer
 * ACTIVE, so deactivating or rejecting someone takes effect on their next
 * request instead of whenever their token happens to expire. It also ends any
 * session that was signed in before the last password change or reset, so
 * changing a password locks out whoever else was holding the old one.
 */
export function applyAccountState(token: JWT, account: AccountState | null): JWT | null {
  if (!account || account.status !== "ACTIVE") return null;
  // Tokens issued before authAt existed count as signed in at 0 — i.e. before any password change.
  if (account.passwordChangedAt && account.passwordChangedAt.getTime() > (token.authAt ?? 0)) return null;
  token.role = account.role;
  token.status = account.status;
  token.photo = account.photo;
  token.isSystemAdmin = account.isSystemAdmin;
  return token;
}
