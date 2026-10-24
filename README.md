# Magis Realty & Brokerage

Marketing website and agent/admin portal for Magis Realty & Brokerage.
Next.js (App Router) + TypeScript, Prisma on PostgreSQL, Auth.js (credentials,
JWT sessions), Cloudinary uploads, Resend email, Upstash Redis rate limiting.

> This project uses a newer Next.js than most documentation covers. See
> `AGENTS.md` and `node_modules/next/dist/docs/` before changing framework-level code.

## Getting started

```bash
npm install
cp .env.example .env        # then fill in values — see "Environment" below
docker compose up -d db     # local Postgres on :5432
npm run db:deploy           # apply migrations
npm run db:seed             # roles/permissions, FAQs, badges (idempotent, creates no users)
npm run db:create-admin     # create the first Administrator
npm run dev                 # http://localhost:3000
```

Run the project from this folder. The original `Downloads/Magis Realty & Brokerage`
folder has an `&` in its name that breaks npm/Next.js tooling on Windows.

## Environment

`.env.example` lists every variable with placeholders only. Never commit real values;
`.env*` is git-ignored.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection (use the direct, non-pooled URL for migrations) |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Session signing, and the site's public URL. **`NEXTAUTH_URL` is also what emailed reset/verification/invite links are built from** — set it in production (on Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is used as a fallback) |
| `CLOUDINARY_*` | Image and document storage |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting. Without them production falls back to weaker per-instance limits and logs a warning |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Transactional email; without a key emails are skipped |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional Cloudflare Turnstile on public forms |
| `TRUST_PROXY` | Set to `1` only if your own reverse proxy overwrites `X-Forwarded-For`. On Vercel it is trusted automatically; otherwise client IPs are not read from headers |
| `AUTH_TRUST_HOST` | Needed by Auth.js when self-hosting (Vercel sets this up itself) |

**Local gotcha:** `vercel env pull` writes `.env.local` / `.env.production.local` with
secret values *blank* (`DATABASE_URL=""`). Next.js lets those blanks override `.env`, so a
plain `npm run dev` can lose its database URL and auth secret. Delete the blank lines, or
export the variables in your shell (shell values win). The e2e suite sets its own
environment and is not affected.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `start` | Dev server / production server |
| `npm run build` | Applies migrations, then `next build`. **Preview deployments (`VERCEL_ENV=preview`) skip the migration step** so unreviewed branches can't change a shared database |
| `npm run db:deploy` | `prisma migrate deploy` — apply pending migrations |
| `npm run db:migrate` | `prisma migrate dev` — create a migration from schema changes |
| `npm run db:seed` / `db:create-admin` | Bootstrap data / first administrator |
| `npm run db:remove-mock-data`, `db:reset-content` | **Destructive** maintenance scripts — read their headers first; both default to a dry run and print the target host |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Playwright e2e. Local database only (refuses anything else); creates and removes its own test accounts. Needs `docker compose up -d db` |
| `npm run lint` | ESLint |

## Structure

- `app/(public)/` — public site: home, about, properties, agents, blog, careers, contact, FAQs, login/register/reset
- `app/portal/` — signed-in portal: dashboard, listings, leads, leaderboard, attendance, blogs, commissions, documents, careers, teams, users, permissions, settings, system
- `lib/actions/` — Server Actions. **Every export of a `"use server"` file is a public endpoint**: each must authenticate (a test enforces this). Helpers that must not be callable (`requireAdmin`, `requirePermission`, `createNotification`) live outside these files
- `lib/authz.ts` — `requirePermission(key)` / `requireAdmin()`: server-side guards that read the account from the database. UI checks (`hasPermission`) are conveniences only
- `lib/permissionResolution.ts` — the single rule for effective permissions (user override → role default → built-in default; Manage Permissions is Administrator-only)
- `auth.ts` — Auth.js config. Sessions are re-validated against the database on every request (deactivation, demotion and password changes end them)
- `lib/securityHeaders.ts` — CSP and other response headers (applied in `next.config.ts`)
- `prisma/` — schema, migrations, seed and admin scripts
- `tests-e2e/` — Playwright specs

## Security notes

- Passwords: 12–72 bytes (`lib/passwordPolicy.ts`). Changing or resetting one signs out every older session.
- Login, registration and reset forms don't reveal whether an account exists.
- Uploads are checked by file contents, not name or declared type (`lib/fileSignature.ts`).
- Uploaded files are served from public Cloudinary URLs; treat anything uploaded as not secret.
- The CSP allows inline scripts (`'unsafe-inline'`) because Next's bootstrap needs it without nonces.
