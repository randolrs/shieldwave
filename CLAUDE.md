# CLAUDE.md — ShieldWave Project Context

## What This Is

ShieldWave is a production insurance brokerage web app for pressure washing / exterior cleaning contractors. It handles the full flow: intake → carrier quoting → payment → policy binding → COI delivery.

## Architecture

Monorepo with two packages:
- `packages/frontend` — React 18 + Vite + Tailwind CSS (port 5173)
- `packages/backend` — Node.js + Express ESM (port 3001)

Frontend proxies `/api` requests to backend in dev via Vite config.

## Build & Run

```bash
npm install          # Install all workspace deps
npm run dev          # Start both frontend + backend
npm run dev:frontend # Frontend only
npm run dev:backend  # Backend only
npm run build        # Production build (frontend only)
```

## Key Files

- `packages/backend/src/services/fieldMapper.js` — Maps 8 intake questions to ACORD carrier fields. This is core IP.
- `packages/backend/src/services/carrierRouter.js` — Tiered quoting: Coterie → Bold Penguin → manual review.
- `packages/backend/src/services/coterieClient.js` — Coterie Insurance API integration.
- `packages/backend/src/routes/quotes.js` — Main quoting endpoint with Zod validation.
- `packages/backend/src/routes/bind.js` — Policy binding with COI caching and email.
- `packages/backend/src/db/migrations/001_initial_schema.sql` — Full PostgreSQL schema.
- `packages/frontend/src/pages/GetQuote.jsx` — 8-step intake stepper.

## Business Rules

- NAICS 561790 for most pressure washing. 561720 for window/gutter only.
- Claims > 2 → skip instant carriers, route to E&S/manual review.
- Employee count > 1 → recommend workers comp.
- Chemical use → recommend pollution liability.
- Revenue > $30K → assume business vehicles → recommend commercial auto.
- Producer code MUST be included in every carrier API call (commission tracking).
- Never hold premium dollars — pass-through only.

## Database

PostgreSQL via Supabase. Tables: customers, quotes, policies, commissions, certificate_holders.
Migration SQL is in `packages/backend/src/db/migrations/`.

## Styling

- Colors: Navy (#0d1424) base, volt green (#c8ee44) accent
- Fonts: Space Grotesk (display), DM Sans (body), JetBrains Mono (mono)
- Design: Industrial-utilitarian, sharp edges, large touch targets, mobile-first
