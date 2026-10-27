import "server-only";
import { prisma } from "@/lib/prisma";

type Entry = {
  userId?: string | null;
  /** Name or email snapshot, so history survives the account being deleted. */
  userLabel: string;
  action: string;
  module: string;
  ip?: string | null;
};

/**
 * Appends to the activity log without ever failing the caller: an audit write
 * that can't be saved is logged to the console, but never breaks a sign-in or
 * a permission change.
 */
export async function logActivity(entry: Entry): Promise<void> {
  try {
    await prisma.activityLogEntry.create({
      data: {
        userId: entry.userId ?? null,
        userLabel: entry.userLabel.slice(0, 200),
        action: entry.action.slice(0, 400),
        module: entry.module,
        ip: entry.ip ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] could not record entry:", err);
  }
}

/** After this many failed sign-ins on one account inside the window, further ones aren't written. */
const FAILED_SIGN_IN_LOG_CAP = 5;
const FAILED_SIGN_IN_WINDOW_MS = 15 * 60_000;

/**
 * Records a failed sign-in for an existing account. The cap keeps someone
 * hammering a known email from filling the table; the rate limiter already
 * stops them well before the log matters, this is for a distributed attempt.
 */
export async function logFailedSignIn(user: { id: string; name: string; email: string }, ip: string): Promise<void> {
  try {
    const recent = await prisma.activityLogEntry.count({
      where: {
        userId: user.id,
        action: "Failed sign-in",
        createdAt: { gte: new Date(Date.now() - FAILED_SIGN_IN_WINDOW_MS) },
      },
    });
    if (recent >= FAILED_SIGN_IN_LOG_CAP) return;
  } catch {
    return;
  }
  await logActivity({ userId: user.id, userLabel: user.name || user.email, action: "Failed sign-in", module: "Security", ip });
}
