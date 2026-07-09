# pins-hub AGENTS.md

## Core Rules
- This repo is a Next.js App Router app on Next `16`. Check `node_modules/next/dist/docs/` before using framework behavior you are not sure about.
- Prefer `rtk`-prefixed shell commands when available. If `rtk` is missing, use the raw command.
- Keep changes small and local. Do not refactor working calculator pricing logic unless explicitly asked.
- Preserve the existing dark internal-tool UI with red accents and stable card heights.

## Build / Check Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Vercel build equivalent: `npm run vercel-build`
- Lint: `npm run lint`
- Typecheck: `./node_modules/.bin/tsc --noEmit`
- Prisma generate: `./node_modules/.bin/prisma generate`
- Prisma validate: `./node_modules/.bin/prisma validate`
- Prisma format: `./node_modules/.bin/prisma format --schema prisma/schema.prisma`
- Deploy migrations: `npm run migrate:deploy`

## Prisma / Neon / Vercel Rules
- Database is PostgreSQL only. Do not reintroduce SQLite config.
- `src/lib/db.ts` expects `DATABASE_URL` and rejects `file:` URLs.
- On Vercel, `DATABASE_URL` must be the Neon pooled URL and must not point to localhost.
- Use `DIRECT_DATABASE_URL` for direct migration access when available.
- Do not put credentials, URLs with secrets, or copied `.env` values into code, docs, commits, or prompts.
- Do not run destructive Prisma commands against shared environments.
- Do not seed or overwrite production data.
- If schema changes are made, update `prisma/schema.prisma`, generate Prisma client, and only create/apply migrations when explicitly appropriate.

## UI Rules
- Keep wording consistent with existing navigation: use `Back to Hub`.
- Match current styling: dark panels, zinc borders, red highlights, compact controls.
- Avoid layout shift in existing calculator surfaces. The pricing container must stay mounted/stable.
- Keep forms responsive and practical; favor simple modals/cards over new design systems.
- The Hub card label must remain spelled `Refferals` for now.

## Calculator Rules
- Relevant files: `src/app/hub/calculators/CalculatorClient.tsx`, `src/components/DesignCard.tsx`.
- VAT is currently hardcoded at `27%`. Reuse that rate consistently unless asked to centralize it.
- Do not break existing quote calculations for garment pricing, print pricing, production cost, pins price, PK markup, VAT, or final totals.
- `PK Markup` is per-unit and feeds the customer price before VAT.
- Delivery helper logic is a sales helper inside the calculator and must not affect main calculator totals.
- Keep copy behavior explicit: customer-facing copy should clearly indicate whether values are incl./excl. VAT.

## Refferals Rules
- Referrals are removed/deferred. Do not reintroduce `/hub/referrals`, `/ref/[code]`, referral Prisma models, or loyalty logic unless explicitly requested.


## Repo-Specific Notes
- Cached data loaders live next to routes, e.g. `calculator/data.ts`, `garments/data.ts`, `refferals/data.ts`.
- Server mutations should use server actions where the repo already does.
- Existing active Hub routes:
  - `/hub/calculators/eu/standard`
  - `/hub/garments`


<!-- headroom:rtk-instructions -->
# RTK (Rust Token Killer) - Token-Optimized Commands

When running shell commands, **always prefix with `rtk`**. This reduces context
usage by 60-90% with zero behavior change. If rtk has no filter for a command,
it passes through unchanged — so it is always safe to use.

## Key Commands
```bash
# Git (59-80% savings)
rtk git status          rtk git diff            rtk git log

# Files & Search (60-75% savings)
rtk ls <path>           rtk read <file>         rtk grep <pattern>
rtk find <pattern>      rtk diff <file>

# Test (90-99% savings) — shows failures only
rtk pytest tests/       rtk cargo test          rtk test <cmd>

# Build & Lint (80-90% savings) — shows errors only
rtk tsc                 rtk lint                rtk cargo build
rtk prettier --check    rtk mypy                rtk ruff check

# Analysis (70-90% savings)
rtk err <cmd>           rtk log <file>          rtk json <file>
rtk summary <cmd>       rtk deps                rtk env

# GitHub (26-87% savings)
rtk gh pr view <n>      rtk gh run list         rtk gh issue list

# Infrastructure (85% savings)
rtk docker ps           rtk kubectl get         rtk docker logs <c>

# Package managers (70-90% savings)
rtk pip list            rtk pnpm install        rtk npm run <script>
```

## Rules
- In command chains, prefix each segment: `rtk git add . && rtk git commit -m "msg"`
- For debugging, use raw command without rtk prefix
- `rtk proxy <cmd>` runs command without filtering but tracks usage
<!-- /headroom:rtk-instructions -->
