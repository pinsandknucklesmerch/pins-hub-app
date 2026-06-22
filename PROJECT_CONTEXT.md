# Pins Hub Project Context

This root `PROJECT_CONTEXT.md` is the canonical AI/project context file. An older duplicate exists at `docs/ai-context/PROJECT_CONTEXT.md`; leave it in place unless explicitly asked to consolidate docs.

## Project Overview

- Pins Hub is an internal operations app for Pins & Knuckles.
- It is a compact internal SaaS-style tool, not a marketing site.
- Current operational surfaces cover quote calculators, garment reference data, PK Tax allocation, referral/loyalty planning, and reusable operational reference copy.
- The app should stay practical, dense, and workflow-focused.

## Current Stack

- Next.js `16.2.7` App Router.
- React `19.2.4` and React DOM `19.2.4`.
- TypeScript `^5`.
- Tailwind CSS `^4` via `@tailwindcss/postcss`.
- Prisma `^7.8.0` with `@prisma/client`, `@prisma/adapter-pg`, and `pg`.
- PostgreSQL only; production/deployed database is expected to be Neon.
- Sonner `^2.0.7` for toast notifications.
- `dotenv` is used by Prisma/seed tooling.

## Active Routes

- `/` - Hub home with sidebar, brand hero, and navigation cards for live tools.
- `/hub/calculators` - Region menu for calculator tools.
- `/hub/calculators/eu` - EU calculator menu.
- `/hub/calculators/eu/standard` - Standard EU quote calculator.
- `/hub/calculators/eu/us-clients` - EU pricing flow for US clients.
- `/hub/calculators/uk` - UK calculator menu.
- `/hub/calculators/uk/trade` - UK screen-print trade calculator.
- `/hub/garments` - Garment directory with search, add/edit/delete, EUR/GBP price fields, tags, and connected markup visibility.
- `/hub/pk-tax` - Manual-entry PK Tax and Snuggle pooled payout calculator.
- `/hub/referrals` - Referral reward simulator/planner and shared scenario manager.
- `/hub/reference` - Quick Reference copy, saved local messages, and supplier/logistics emails.
- `/ref/[code]` - Referral landing/lookup route that confirms whether a referral code belongs to a customer. It is QR-ready structure only; QR generation is not currently implemented.

## Design And UI Rules

- Main styling lives in `src/app/globals.css`.
- Shared layout/navigation components:
  - `src/components/HubSidebar.tsx`
  - `src/components/NavigationCard.tsx`
  - `src/components/BackLink.tsx`
  - `src/components/DesignCard.tsx`
  - `src/components/BrandLogo.tsx`
  - `src/components/theme/HubThemeProvider.tsx`
  - `src/components/theme/ThemeToggle.tsx`
- Keep the design dense, compact, dark, and operational.
- Use restrained red accents with zinc/dark panels, stable cards, compact controls, and minimal marketing-style whitespace.
- Preserve shared `hub-*` classes and existing card/panel language where possible.
- Avoid layout shift, especially around calculator result panels; pricing containers are intentionally kept mounted/stable.
- UI-only work must not alter pricing, VAT, PK Tax, referral, loyalty, database, or route behavior unless explicitly requested.
- EU Standard and US Client copied quote layouts are stable customer-facing contracts. Do not redesign, simplify, or reformat copied quote output unless the request explicitly targets quote copy.
- The staging updates content in `src/components/StagingUpdatesPanel.tsx` is manually maintained. Codex must not edit, rewrite, remove, or auto-update staging update notes unless explicitly asked. The panel must remain gated by `process.env.NEXT_PUBLIC_SHOW_STAGING_UPDATES === "true"`.
- Navigation wording should stay consistent with existing routes, especially `Back to Hub`.
- The home card label is intentionally spelled `Refferals` for now.

## Theme System

- Available themes: `brand` and `classic`.
- Theme state is managed in `src/components/theme/HubThemeProvider.tsx`.
- Local storage key: `pins-hub-theme`.
- Default theme: `brand`.
- `src/app/layout.tsx` runs `hubThemeBootstrapScript` before interactive render to apply `theme-brand` or `theme-classic` to the root document and avoid hydration flicker.
- `src/components/theme/ThemeToggle.tsx` is the compact switch UI. It toggles between `brand` and `classic`.
- Theme UI should stay compact and should not introduce separate design systems or route-specific palettes.

## Calculators

### EU Standard Calculator

- Route: `/hub/calculators/eu/standard`.
- Main files:
  - `src/app/hub/calculators/eu/standard/page.tsx`
  - `src/app/hub/calculators/CalculatorPageContent.tsx`
  - `src/app/hub/calculators/CalculatorClient.tsx`
  - `src/components/DesignCard.tsx`
  - `src/app/hub/calculators/data.ts`
  - `src/app/hub/calculators/copyFormatters.ts`
  - `src/app/hub/calculators/displayStandards.ts`
- Data source: Prisma `Garment`, `PrintPrice`, and `CalculatorProfile`/`GarmentMarkup` for `STANDARD_EU`.
- Data is cached by `unstable_cache` with calculator reference tag `calculator-reference`.
- Currency: EUR (`€`).
- VAT is hardcoded at `27%` in the EU calculator client and copy formatter.
- Garment markup comes from `GarmentMarkup` by garment type for the active calculator profile.
- `PK Markup` is an optional per-unit value on each item and feeds the customer price before VAT.
- Delivery helper is a sales helper only and does not affect main calculator totals. Delivery copy includes incl./excl. VAT wording.
- Box Capacity Guide modal is present.
- Copy/export behavior uses clipboard fallback and Sonner toasts.
- Customer-facing quote copy should not include calculator type names.
- Item labels are editable in `DesignCard`; blank labels fall back to `Item #n` through `getBreakdownItemLabel`.
- Embroidery is implemented in the shared EU `DesignCard` flow:
  - Sizes: Small, Medium, Large.
  - Customer unit costs: `1.50`, `2.00`, `2.75`.
  - Production unit costs: `1.25`, `1.85`, `2.50`.
  - Customer digitizing fee: `25`.
  - Production digitizing cost: `23`.
  - EU embroidery markup per unit is `3`, unless the calculator title contains `trade`.
- Do not change garment pricing, print pricing, production cost, pins price, PK markup, VAT, or final totals unless explicitly requested.

### EU US Clients Calculator

- Route: `/hub/calculators/eu/us-clients`.
- Main files are the same shared EU calculator files as Standard EU, with profile code `US_CLIENTS`.
- Data source: Prisma calculator profile `US_CLIENTS`.
- Currency: EUR (`€`).
- VAT is still `27%`.
- Garment markups differ from Standard EU via seeded profile data.
- Customer quote copy uses `formatUsClientQuoteCopy`.
- Dark garment/base copy behavior is implemented as a ` + base` suffix in the US client garment summary.
- Customer-facing quote copy should not include calculator type names.
- Item-label renaming behavior is the same as Standard EU.
- Delivery helper and embroidery behavior are the same shared EU calculator behavior.

### UK Trade Calculator

- Route: `/hub/calculators/uk/trade`.
- Main files:
  - `src/app/hub/calculators/uk/trade/page.tsx`
  - `src/app/hub/calculators/uk/trade/UkTradeCalculatorClient.tsx`
  - `src/app/hub/calculators/uk/trade/UkTradeDesignCard.tsx`
  - `src/app/hub/calculators/uk/trade/data.ts`
  - `src/app/hub/calculators/uk/trade/types.ts`
  - `src/app/hub/calculators/uk/tradeScreenPrintData.ts`
  - shared copy/display helpers in `src/app/hub/calculators/copyFormatters.ts` and `displayStandards.ts`
- Data source: Prisma `Garment` records selected through `ukTradeGarmentSelect`; uses `gbpPrice`.
- Data is cached with tag `uk-trade-garments`.
- Currency: GBP (`£`).
- Pricing assumptions:
  - Screen print quantity tiers: `50`, `100`, `200`, `500`, `1000`, `2500`, `5000`, `10000`.
  - Colour counts supported: `1` through `10`.
  - Setup charge: `£20` per colour.
  - Minimum quantity is effectively `50`.
  - Missing `gbpPrice`, missing garment, no selected print positions, or unsupported price tiers produce missing-price states.
- Copy behavior uses `formatUkTradeQuoteCopy`; it does not add VAT lines.
- Item labels are editable and fall back to `Item #n`.
- The results panel is kept mounted with opacity changes to avoid layout jumps.

## Garment Directory

- Route: `/hub/garments`.
- Main files:
  - `src/app/hub/garments/page.tsx`
  - `src/app/hub/garments/GarmentDirectoryClient.tsx`
  - `src/app/hub/garments/data.ts`
  - `src/app/hub/garments/actions.ts`
- Prisma models involved:
  - `Garment`
  - `GarmentMarkup`
  - `CalculatorProfile`
- Garment fields include `code`, `altCode`, `brandName`, `name`, `color`, `type`, `basePrice`, optional `gbpPrice`, optional `extraSizeCost`, and `tags`.
- Directory rows also expose `connectedMarkupValue`, currently pulled from the Standard EU calculator profile by garment type.
- Caching/revalidation:
  - Loader uses `unstable_cache` with tag `garment-directory`.
  - Garment actions revalidate the garment directory and calculator reference surfaces.
- Client supports search across code, alt code, brand, name, color, and tags.
- Add/edit modals include EUR base price, GBP price, extra size cost, tags, and garment metadata.
- Known setup issue: routes depending on Prisma schema changes require regenerated Prisma client after schema edits; referral data loader has explicit handling for a missing generated `ReferralScenario` delegate.

## PK Tax

- Route: `/hub/pk-tax`.
- Main files:
  - `src/app/hub/pk-tax/page.tsx`
  - `src/app/hub/pk-tax/PkTaxCalculatorClient.tsx`
- Current behavior:
  - Manual-entry monthly finance calculator.
  - Inputs include month, GBP/ZAR exchange rate, bulk company profit, per-person company profit, Snuggle profit, PK Tax, order count, and eligibility.
  - Default rows: Bux, Hardus, Justin, Seth, Shannon, Johan.
  - Output is copy-ready and includes GBP and ZAR totals.
- Pool model:
  - The PK Tax system uses a pooled bonus model.
  - Shared sales team pool = `40%` of shared-pool PK Tax base plus `7%` of Snuggle profit.
  - Shared-pool PK Tax base includes Bux, Hardus, Justin, Seth, and Shannon.
  - Johan’s PK Tax is kept separate; Johan receives `40%` of his own PK Tax outside the shared pool.
  - Shannon contributes to pool/weighted math but is not a pool recipient.
- Allocation weighting:
  - Company Profit: `40%`.
  - Snuggle Profit: `25%`.
  - PK Tax: `20%`.
  - Orders handled: `15%`.
  - Each person’s percentage contribution in each category is multiplied by that category weighting and summed into a final weighted performance score.
  - The final weighted score determines initial share of the shared pool.
  - Non-recipient calculated shares are redistributed across eligible recipients.
  - Eligible shared-pool recipients are Bux, Hardus, Justin, and Seth.
- Additional business rules:
  - EPCC retained allocation is `40%` of total Netsuite PK Tax.
  - Admin/bank fees are `10%` of total Netsuite PK Tax.
  - Marketing is `5%` of total Netsuite PK Tax.
  - Operations is `5%` of total Netsuite PK Tax.
  - Factory invoice total is `60%` of total Netsuite PK Tax and excludes Snuggle profit.
  - Guide copy references Netsuite PK Tax Report, Netsuite Profit Report, Snuggle Report, and Netsuite Order Snapshot.
- Do not alter payout weights, Johan handling, Shannon handling, factory invoice math, GBP/ZAR conversion, or copy outputs unless explicitly requested.

## Referrals

- Route: `/hub/referrals`.
- Main files:
  - `src/app/hub/referrals/page.tsx`
  - `src/app/hub/referrals/ReferralsClient.tsx`
  - `src/app/hub/referrals/ReferralScenarioManager.tsx`
  - `src/app/hub/referrals/actions.ts`
  - `src/app/hub/referrals/data.ts`
  - `src/app/hub/referrals/simulator.ts`
  - `src/app/hub/referrals/constants.ts`
  - supporting UI cards/tabs/summary/comparison components in the same folder
- Prisma models involved:
  - `Customer`
  - `Referral`
  - `LoyaltyTransaction`
  - `ReferralScenario`
- Current visible surface is a planning/simulator tool:
  - Rule simulator.
  - Test cases.
  - Scenario comparison.
  - Referral code preview and message/link copy.
  - JSON export and planning summary copy.
- Saved/shared scenario behavior:
  - `ReferralScenario` stores `rulesJson`, `testCasesJson`, and `summaryJson`.
  - Server actions can save, update, duplicate, and delete team scenarios.
  - Loader is resilient if the generated Prisma client does not yet include `ReferralScenario`; it returns a setup issue instead of crashing.
- Real referral/customer actions exist in `actions.ts`:
  - Customer creation generates or normalizes unique referral codes.
  - Referral creation creates the referred customer and logs a referral using the referrer code.
  - Self-referral checks compare email, phone, and name fallback.
- Loyalty rules:
  - Loyalty points must not be silently mutated.
  - Manual loyalty adjustments create a `LoyaltyTransaction` and update `Customer.loyaltyPoints` in the same transaction.
  - Referral reward bonus is `REFERRAL_BONUS_POINTS = 100`.
  - Bonus is awarded when referral status becomes `REWARDED` from another status.
  - The reward creates a `LoyaltyTransaction` of type `REFERRAL_BONUS` and increments the referrer’s points.
- `/ref/[code]`:
  - Looks up a `Customer` by uppercase `referralCode`.
  - Shows confirmed/not-found state.
  - Directs users back to `/hub/referrals`.
  - QR generation is not currently implemented.
- Do not alter referral reward logic or loyalty mutation behavior while updating docs or UI.

## Quick Reference

- Route: `/hub/reference`.
- Main files:
  - `src/app/hub/reference/page.tsx`
  - `src/app/hub/reference/ReferenceClient.tsx`
  - `src/app/hub/reference/referenceData.ts`
- Static reference data source: `referenceItems` in `referenceData.ts`.
- Current static categories include billing, delivery, and imports reference copy.
- Saved custom messages:
  - Stored browser-local only.
  - Local storage key: `pins-hub-reference-saved-messages`.
  - Managed with `useSyncExternalStore` and a stable empty snapshot.
  - Users can create, edit, delete, search, expand, and copy saved messages.
- Supplier/logistics emails:
  - Defined in `ReferenceClient.tsx`.
  - Includes category/company/email rows and copy buttons.
  - Supports copying all supplier/logistics emails at once.
- Search/filter behavior:
  - Search covers titles, body, categories, and warnings.
  - Category filter includes static categories and `Saved Messages` when local saved messages exist.
- Copy behavior uses `navigator.clipboard` when available, textarea fallback otherwise, and Sonner toasts.
- Custom message UI is implemented as an expandable details section, not a database-backed feature.

## Database And Runtime Notes

- Prisma schema: `prisma/schema.prisma`.
- Prisma migrations: `prisma/migrations/`.
- Archived older SQLite migrations live in `prisma/sqlite-migrations-archive/`; do not reintroduce SQLite.
- Current datasource provider is PostgreSQL.
- Runtime DB client: `src/lib/db.ts`.
- `DATABASE_URL` is required at runtime and must not be a `file:` URL.
- On Vercel, `DATABASE_URL` must not point to localhost and should be the Neon pooled PostgreSQL URL.
- `DIRECT_DATABASE_URL` is used by `prisma.config.ts` for direct migration access when available.
- If `DIRECT_DATABASE_URL` is missing, migration config derives a non-pooler URL from `DATABASE_URL`.
- Do not include secrets, copied `.env` values, or database URLs with credentials in code, docs, commits, or prompts.
- Do not run destructive Prisma commands against shared or production environments.
- Seed files:
  - `prisma/seed.ts`
  - `prisma/seed-data.ts`
- Seed behavior is destructive for calculator/catalog tables: it deletes design prints, designs, orders, print prices, garment markups, calculator profiles, and garments before inserting seed data.
- Seeded calculator profiles:
  - `STANDARD_EU`
  - `US_CLIENTS`
- Seeded profile markups:
  - Standard EU: Hoodie `5`, Longsleeve `3.5`, T-shirt `3`.
  - US Clients: Hoodie `4`, Longsleeve `3`, T-shirt `2`.
- Seeded print prices cover colour counts `1` through `9` and quantity ranges from `50` to `2000`.
- Regenerate Prisma client after schema changes.

## Dev Workflow

- Prefer `rtk`-prefixed commands in this repo. If `rtk` is unavailable, use the fallback command.
- Install dependencies: `rtk npm install` or `npm install`.
- Dev server: `rtk npm run dev` or `npm run dev`.
- Lint: `rtk npm run lint` or `npm run lint`.
- TypeScript check: `rtk ./node_modules/.bin/tsc --noEmit` or `npx tsc --noEmit`.
- Build: `rtk npm run build` or `npm run build`.
- Vercel-equivalent build: `rtk npm run vercel-build` or `npm run vercel-build`.
- Prisma validate: `rtk ./node_modules/.bin/prisma validate` or `./node_modules/.bin/prisma validate`.
- Prisma generate: `rtk ./node_modules/.bin/prisma generate` or `./node_modules/.bin/prisma generate`.
- Deploy migrations: `rtk npm run migrate:deploy` or `npm run migrate:deploy`.

## Important Do And Don't Rules

Do:

- Keep UI compact and operational.
- Preserve explicit incl./excl. VAT copy.
- Keep calculator result panels stable.
- Use skeletons/loading states for slow database-backed routes where appropriate.
- Regenerate Prisma client after schema changes.
- Keep customer-facing copied quote text clean and operational.

Don't:

- Do not change pricing, VAT, PK Tax, referral, loyalty, or database behavior unless explicitly requested.
- Do not run destructive Prisma commands against shared or production environments.
- Do not seed or overwrite production data.
- Do not commit secrets, `.env` values, or database URLs with credentials.
- Do not add marketing-style UI patterns.
- Do not include calculator type names in copied quote text.
