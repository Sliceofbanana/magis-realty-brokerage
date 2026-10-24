import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Every export of a "use server" file is a public HTTP endpoint. This guards
 * against adding one that neither authenticates the caller nor is on the
 * short list of intentionally public entry points (sign-in, registration,
 * password reset, and the rate-limited, bot-checked public forms).
 */
const ACTIONS_DIR = __dirname;

const INTENTIONALLY_PUBLIC = new Set([
  "loginAction",
  "demoLoginAction", // refuses to run in production
  "logoutAction",
  "registerAction",
  "resendVerificationEmailAction",
  "verifyEmailAction",
  "requestPasswordResetAction",
  "resetPasswordAction",
  "submitInquiryAction",
  "createJobApplicationAction",
  "subscribeToNewsletterAction",
]);

/** Evidence the function checks who is calling, directly or through a guarded helper. */
const GUARD =
  /\bauth\(\)|requireAdmin\(|requireSystemAdmin\(|setStatus\(|deleteDocumentAction\(|archivePropertyAction\(|performCheckIn\(/;

function exportedFunctions(source: string): { name: string; body: string }[] {
  const out: { name: string; body: string }[] = [];
  const re = /^export async function (\w+)/gm;
  const starts = [...source.matchAll(re)].map((m) => ({ name: m[1], index: m.index! }));
  starts.forEach((s, i) => {
    const end = i + 1 < starts.length ? starts[i + 1].index : source.length;
    out.push({ name: s.name, body: source.slice(s.index, end) });
  });
  return out;
}

describe("server action authentication coverage", () => {
  const files = readdirSync(ACTIONS_DIR).filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".test.ts")
  );

  for (const file of files) {
    const source = readFileSync(path.join(ACTIONS_DIR, file), "utf8");
    if (!/^["']use server["']/.test(source)) continue;

    for (const fn of exportedFunctions(source)) {
      it(`${file}: ${fn.name} authenticates the caller`, () => {
        expect(INTENTIONALLY_PUBLIC.has(fn.name) || GUARD.test(fn.body)).toBe(true);
      });
    }
  }
});
