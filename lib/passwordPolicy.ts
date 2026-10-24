/**
 * The one password rule, used by registration, password reset and password
 * change — client forms (via lib/validation.ts) and Server Actions alike.
 *
 * Length is what matters; no composition rules. The upper bound exists
 * because bcrypt only reads the first 72 bytes: anything longer would be
 * silently truncated, and accepting it would be a false promise.
 */
export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_BYTES = 72;

/** Returns a user-facing error, or null when the password is acceptable. */
export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    return `Password is too long (maximum ${MAX_PASSWORD_BYTES} bytes).`;
  }
  return null;
}
