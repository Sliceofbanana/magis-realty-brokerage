import fs from "node:fs";
import dotenv from "dotenv";
import { defineConfig, devices } from "@playwright/test";

// The dev server the suite starts gets an explicit, local-only environment.
// Real process env beats every .env* file in Next, so this also keeps stale
// or blank values in .env.local / .env.production.local (e.g. a Vercel pull)
// from shadowing the local database — and keeps the suite away from real
// email, upload and rate-limit services.
const localEnv = fs.existsSync(".env") ? dotenv.parse(fs.readFileSync(".env")) : {};
const databaseUrl = process.env.DATABASE_URL || localEnv.DATABASE_URL || "";
let databaseHost = "";
try {
  databaseHost = new URL(databaseUrl).hostname;
} catch {
  // falls through to the check below
}
if (!["localhost", "127.0.0.1", "[::1]"].includes(databaseHost)) {
  throw new Error("E2E tests only run against a local DATABASE_URL (localhost / 127.0.0.1).");
}
process.env.DATABASE_URL = databaseUrl;

export default defineConfig({
  testDir: "./tests-e2e",
  fullyParallel: false, // tests share one Postgres dev DB — avoid cross-test data races
  globalSetup: "./tests-e2e/global-setup.ts",
  globalTeardown: "./tests-e2e/global-teardown.ts",
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    env: {
      DATABASE_URL: databaseUrl,
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "e2e-only-secret-not-for-production",
      RESEND_API_KEY: "",
      CLOUDINARY_CLOUD_NAME: "",
      CLOUDINARY_API_KEY: "",
      CLOUDINARY_API_SECRET: "",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
    },
    timeout: 60_000,
  },
});
