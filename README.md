# Pins Hub

Pins Hub is an internal operations app for Pins & Knuckles. It is a compact SaaS-style tool for quote calculators, garment reference data, PK Tax allocation, and reusable operational reference copy.

This is not a marketing site.

## Features

- Hub home
- EU Standard Calculator
- EU US Clients Calculator
- UK Trade Calculator
- Garment Directory
- PK Tax Calculator
- Quick Reference

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7 with `@prisma/adapter-pg`
- PostgreSQL / Neon
- Sonner toasts

## Active Routes

- `/` - Hub home
- `/hub/calculators` - calculator index
- `/hub/calculators/eu` - EU calculator index
- `/hub/calculators/eu/standard` - EU Standard Calculator
- `/hub/calculators/eu/us-clients` - EU US Clients Calculator
- `/hub/calculators/uk` - UK Trade Calculator index
- `/hub/calculators/uk/trade` - UK Trade Calculator
- `/hub/garments` - Garment Directory
- `/hub/pk-tax` - PK Tax Calculator
- `/hub/reference` - Quick Reference

## Local Setup

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm run vercel-build
./node_modules/.bin/prisma validate
```

## Environment Notes

- `DATABASE_URL` is required.
- `DATABASE_URL` must point to PostgreSQL / Neon. Do not use or reintroduce `file:` SQLite URLs.
- Use `DIRECT_DATABASE_URL` for direct migration access where available.
- Never commit `.env` values, secrets, database credentials, or production URLs.

## Deployment Notes

- Vercel uses Neon for PostgreSQL.
- `npm run vercel-build` should generate Prisma, deploy migrations, and build the Next.js app.
- Seed scripts are destructive for catalog and calculator data. Do not run them against production unless that reset is intentional.

## Safety Notes

- During README-only work, do not change pricing, VAT, PK Tax, Prisma models, or database behavior.
- Do not edit staging update notes unless explicitly requested.
- Keep language practical and internal-tool focused. Do not add marketing-style copy.
