/** Shared client-side field rules — kept in one place so every form (auth
 * pages, SimpleForm) agrees on what "valid" means, matching the same rules
 * enforced server-side in lib/actions/auth.ts. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export const MIN_PASSWORD_LENGTH = 8;
