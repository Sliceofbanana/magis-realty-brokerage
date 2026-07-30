# Magis Realty & Brokerage

A front-end-only Next.js build of the Magis Realty & Brokerage marketing site
and agent/admin portal, generated from Figma exports for a client walkthrough.
There is no backend, database, or real authentication — all data is static
mock data in `lib/data/`, and forms/filters are client-side only.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note on project location:** this project intentionally lives at
> `Downloads/magis-realty-brokerage`, a sibling of the original
> `Downloads/Magis Realty & Brokerage` folder (which still holds the source
> Figma PNGs). The `&` in that folder name breaks npm/Next.js tooling on
> Windows (`cmd.exe` treats `&` as a command separator), so `npm run dev` /
> `npm run build` must be run from this folder, not the original one.

## Structure

- `app/(public)/` — public marketing site (shares `PublicHeader` + `Footer`): home, about,
  properties (+ detail), agents (+ profile), blog (+ detail), contact, FAQs, login.
- `app/portal/` — agent/admin portal (shares a sidebar + top bar shell): dashboard, profile,
  listings, leads, leaderboard, blogs, commissions, documents, settings (5 tabs).
- `components/ui/` — shared primitives (Button, Badge, Card, Tabs, Accordion, Pagination, etc.)
- `components/public/` — public-site components (header, footer, cards, forms)
- `components/portal/` — portal shell components (sidebar, top bar, page header)
- `lib/data/` — all mock content (properties, agents, blog posts, leads, transactions, etc.)

## Notes for the client

- **Portal access is unified for this demo**: the portal sidebar shows every
  section (including Users, Activity Log, and Commission Rules under
  Settings) to any signed-in session — admin/agent permissions have not been
  split apart yet, per current scope.
- **Login bypass**: the `/login` page includes a "Skip Login (Demo)" button
  that routes straight into `/portal` without credentials, for walkthrough
  convenience. Remove this before any real deployment.
- **Images** are placeholder photography from picsum.photos (seeded so they
  stay consistent between reloads) — swap in real property/agent photography
  in `lib/data/*.ts` before launch.
- Forms validate client-side and show a success state on submit; nothing is
  actually sent anywhere.
