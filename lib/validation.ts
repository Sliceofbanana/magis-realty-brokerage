/** Shared client-side field rules — kept in one place so every form (auth
 * pages, SimpleForm) agrees on what "valid" means, matching the same rules
 * enforced server-side in lib/actions/auth.ts. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export const MIN_PASSWORD_LENGTH = 8;

export type FieldStatus = "neutral" | "error" | "success";

/** Border/focus classes for a field's current validation state — same
 * neutral look until touched, then red or green depending on outcome. */
export function fieldStateClasses(status: FieldStatus): string {
  if (status === "error") return "border-red-400 focus:border-red-500";
  if (status === "success") return "border-emerald-400 focus:border-emerald-500";
  return "border-black/10 focus:border-navy-900";
}

