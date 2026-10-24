// Anyone whose account predates this cutoff is grandfathered past the
// "verify your email" login gate — email verification didn't exist before
// this feature shipped, so there's no verification link they could ever have
// clicked. Only registrations from this point on are held to it.
const EMAIL_VERIFICATION_LAUNCHED_AT = new Date("2026-09-01T00:00:00Z");

/** True when this account must verify its email before it may sign in. */
export function needsEmailVerification(user: { emailVerified: Date | null; createdAt: Date }): boolean {
  return !user.emailVerified && user.createdAt >= EMAIL_VERIFICATION_LAUNCHED_AT;
}
