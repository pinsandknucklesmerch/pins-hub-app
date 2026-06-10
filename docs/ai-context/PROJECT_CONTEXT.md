# Pins Hub Project Context

`pins-hub` is the internal **Pins Hub** app. The UI and metadata now use Pins Hub language, not dashboard language.

## Product Areas

- `Home` (`/`): entry point to the hub. Active cards are `Price Calculators`, `Garment Directory`, `PK Tax`, and `Referrals`.
- `Placeholders on Home`: `Order Management` and `US Calculator` are visible but disabled.
- `Price Calculators` (`/hub/calculators`): region picker for calculator areas.
- `EU` (`/hub/calculators/eu`): active calculator area with `Standard EU Calculator` and `US Clients Calculator`, plus a disabled `Trade Calculator` placeholder.
- `UK` (`/hub/calculators/uk`): visible region card only; no UK calculators are implemented yet.
- `Garment Directory` (`/hub/garments`): active garment management view.
- `PK Tax` (`/hub/pk-tax`): active manual monthly PK Tax calculator.
- `Referrals` (`/hub/referrals`): active referral and loyalty management.
- `Referral landing page` (`/ref/[code]`): QR-ready landing page only. No QR generation logic is implemented.

Current code spells the referral section `Referrals`. There is no live `Refferals` label in the repository.

## Repository Structure

```text
src/
  app/
    layout.tsx
    globals.css
    page.tsx
    hub/
      loading.tsx
      calculators/
        page.tsx
        CalculatorPageContent.tsx
        CalculatorClient.tsx
        CalculatorLoading.tsx
        copyFormatters.ts
        data.ts
        eu/
          page.tsx
          standard/
            page.tsx
            loading.tsx
          us-clients/
            page.tsx
            loading.tsx
        uk/
          page.tsx
      garments/
        page.tsx
        loading.tsx
        GarmentDirectoryClient.tsx
        data.ts
        actions.ts
      pk-tax/
        page.tsx
        PkTaxCalculatorClient.tsx
      referrals/
        page.tsx
        loading.tsx
        ReferralsClient.tsx
        data.ts
        actions.ts
        constants.ts
    ref/[code]/page.tsx
  components/
    NavigationCard.tsx
    DesignCard.tsx
  lib/
    db.ts
    calculator-profiles.ts
prisma/
  schema.prisma
  seed.ts
  seed-data.ts
  migrations/
docs/
  ai-context/PROJECT_CONTEXT.md
package.json
vercel.json
prisma.config.ts
```

## Calculators

### Shared flow

- `src/app/hub/calculators/CalculatorPageContent.tsx` loads calculator reference data server-side and renders `CalculatorClient`.
- `src/app/hub/calculators/data.ts` caches garments, print prices, and calculator-profile garment markups behind the `calculator-reference` tag.
- `src/components/DesignCard.tsx` is the shared per-design editor.
- `src/app/hub/calculators/copyFormatters.ts` contains the shared copy/export helpers.
- `VAT` is hardcoded at `27%`.
- The pricing container stays mounted so selecting a garment does not cause layout shift.
- `PK Markup` is per-unit and is included in the customer-facing quote before VAT.
- Delivery helper logic is separate from the main calculator totals.

### Pricing logic

- `calculateDesignCosts()` combines:
  - garment base price
  - calculator-profile garment markup
  - print price tier for each selected print position
  - optional PK markup per unit
- `getPrintUnitPrices()` uses the selected position, quantity range, and color count tier from `PrintPrice`.
- `NECK` prints use the fixed unit price `0.7` and bypass the tier lookup.
- Color counts are stored in `Design.positions` as `Record<string, number>`.
- Color inputs can now be temporarily empty while editing; they normalize back to `1` on blur if empty or invalid, with a warning that valid color counts are `1` to `9`.

### Quote copy

- `formatEuQuoteCopy()` keeps the existing EU format:
  - item header with garment code/name
  - positions in long form such as `1 Col Front`
  - quantity line using `ea = total`
- `formatUsClientQuoteCopy()` is US-specific:
  - positions use short labels like `1c front`
  - quantity line is `[quantity] x [unit] each ([subtotal] ex vat)`
  - a VAT line and TOTAL line are included
  - the subtotal uses the same components as pins pricing: base cost, pins print cost, garment markup, and PK markup
- `getQuoteFormatter()` chooses the US formatter only when `calculatorTitle === "US Clients Calculator"`.
- `formatDeliveryCopy()` is separate and does not affect calculator pricing.

### Active calculator routes

- `/hub/calculators/eu/standard` - `Standard EU Calculator`
- `/hub/calculators/eu/us-clients` - `US Clients Calculator`
- `/hub/calculators/uk` - visible placeholder only

## UI Conventions

- Global theme is dark: `body` uses black background, white text, and red selection styling.
- `Toaster` is mounted globally in the bottom-right with dark theme.
- Shared card styling uses dark panels, zinc borders, red accents, rounded corners, and compact controls.
- `NavigationCard` supports interactive and disabled states with a badge tone and optional arrow treatment.
- `Back to Hub` is the standard wording on hub-level routes.
- `Back to Calculators` is used on calculator drill-down pages.
- `Back to Regions` is used on calculator region index pages.
- Loading states use dark skeleton blocks and preserve the same overall card structure as the loaded page.
- The calculator loading shell is shared by the standard and US Clients calculator routes.

## Database / Prisma

### Models

Current Prisma models:

- `Garment`
- `GarmentMarkup`
- `CalculatorProfile`
- `PrintPrice`
- `Order`
- `Design`
- `DesignPrint`
- `Customer`
- `Referral`
- `LoyaltyTransaction`

Current enums:

- `PrintPosition`
- `GarmentType`
- `ReferralStatus`
- `LoyaltyTransactionType`

### Seed state

- `prisma/seed.ts` deletes and reseeds the calculator reference data.
- Current seed counts:
  - `47` garments
  - `45` print-price tiers
  - `2` calculator profiles
  - `3` garment markups per calculator profile
- Seeded calculator profiles:
  - `STANDARD_EU`
  - `US_CLIENTS`
- Seeded markups:
  - `STANDARD_EU`: `HOODIE=5`, `LONGSLEEVE=3.5`, `TSHIRT=3`
  - `US_CLIENTS`: `HOODIE=4`, `LONGSLEEVE=3`, `TSHIRT=2`

### Cache invalidation

- `src/app/hub/garments/actions.ts` revalidates the garment directory tag, the calculator reference tag, and the `/hub/garments`, `/hub/calculators/eu/standard`, and `/hub/calculators/eu/us-clients` paths after garment changes.
- `src/app/hub/referrals/actions.ts` revalidates the referrals tag and `/hub/referrals` after referral mutations.
- `src/app/hub/referrals/data.ts` returns a setup state instead of crashing if the Prisma client or tables are not ready.

## Deployment / Config

### Scripts

- `npm run dev` -> `next dev`
- `npm run build` -> `prisma generate && next build`
- `npm run vercel-build` -> `prisma generate && next build`
- `npm run migrate:deploy` -> `prisma migrate deploy`
- `npm run lint` -> `eslint`
- `npm run start` -> `next start`
- `npm run postinstall` -> `prisma generate`

### Build and deployment

- `vercel.json` uses `npm run vercel-build`.
- Migrations are deployed separately with `npm run migrate:deploy`; they do not run automatically during the normal Vercel build.
- `prisma.config.ts` points Prisma at `prisma/schema.prisma` and `prisma/migrations`.
- Prisma seeding uses `npx ts-node --project tsconfig.seed.json prisma/seed.ts`.

### Environment variables

- `DATABASE_URL` is required at runtime.
- `DIRECT_DATABASE_URL` is used for direct migration access when available.
- On Vercel, `DATABASE_URL` must be the Neon pooled URL and must not point to localhost.

## Operational Notes

- `src/lib/db.ts` rejects `file:` URLs, so the app is PostgreSQL-only.
- If `DATABASE_URL` points to localhost while `VERCEL=1`, startup fails.
- Calculator pages require matching `CalculatorProfile` rows. If a profile is missing, the calculator data loader throws.
- The referral route is intentionally resilient and shows a setup state if Prisma is missing or the referral tables are not available.
- `Order Management` is currently a placeholder card only; there is no route yet.
- `Trade Calculator` is currently a placeholder card only.
- The UK calculator area is visible but intentionally empty.

## Business Tools

### PK Tax

- Route: `/hub/pk-tax`
- Files:
  - `src/app/hub/pk-tax/page.tsx`
  - `src/app/hub/pk-tax/PkTaxCalculatorClient.tsx`
- What it does:
  - manual-entry monthly calculator for PK Tax and Snuggle pool distribution
  - calculates weighted results for account managers
  - derives shared pool, separate Johan payout, and total payable values
- Inputs:
  - company profit
  - Snuggle profit
  - PK Tax
  - orders
  - exchange rate
  - per-row eligibility and weighting
- Output/copy:
  - summary copy includes Netsuite PK Tax allocation, shared pool inputs, per-person payouts, total redistributed amount, total payable GBP, and total payable ZAR
  - factory invoice total can be copied separately
- Important rules:
  - the shared pool uses 40% of PK Tax from Bux, Hardus, Justin, Seth, and Shannon
  - Johan is treated separately and gets 40% of own PK Tax when in the separate mode
  - calculator reset and copy actions surface toast feedback
- Known limitation:
  - this is a manual-entry tool, not an automated sync with Netsuite or Monday

### Referrals

- Route: `/hub/referrals`
- Files:
  - `src/app/hub/referrals/page.tsx`
  - `src/app/hub/referrals/ReferralsClient.tsx`
  - `src/app/hub/referrals/data.ts`
  - `src/app/hub/referrals/actions.ts`
  - `src/app/hub/referrals/constants.ts`
- What it does:
  - manage customers, referral records, loyalty points, and referral status updates
  - supports search, copyable referral links, and manual loyalty adjustments
- Inputs:
  - customer name, email, phone, referral code
  - referral code used
  - loyalty point change and reason
  - referral status
- Output/copy:
  - referral links use `/ref/[code]`
  - toast feedback is used for success/error states
- Important rules:
  - loyalty changes are logged through `LoyaltyTransaction`; points are not mutated silently
  - `REWARDED` status triggers the referral bonus
  - `REFERRAL_BONUS_POINTS` is `100`
  - `createReferral()` prevents obvious self-referrals and duplicate identities
- Known limitation:
  - the page depends on the referral tables and client shape being available; otherwise it shows setup guidance

### Garment Directory

- Route: `/hub/garments`
- Files:
  - `src/app/hub/garments/page.tsx`
  - `src/app/hub/garments/GarmentDirectoryClient.tsx`
  - `src/app/hub/garments/data.ts`
  - `src/app/hub/garments/actions.ts`
- What it does:
  - shows garments, their base data, and the calculator markup currently connected to the `STANDARD_EU` calculator profile
- Cache behavior:
  - directory data is cached behind the `garment-directory` tag
  - mutations revalidate the directory tag, the calculator reference tag, and the garment/calculator paths listed above

## Files to Inspect First

- `src/app/page.tsx`
- `src/app/hub/calculators/page.tsx`
- `src/app/hub/calculators/eu/page.tsx`
- `src/app/hub/calculators/CalculatorClient.tsx`
- `src/app/hub/calculators/copyFormatters.ts`
- `src/app/hub/garments/actions.ts`
- `src/app/hub/referrals/actions.ts`
- `src/app/hub/pk-tax/PkTaxCalculatorClient.tsx`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/seed-data.ts`

## Verification Commands

- `npx prisma validate`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run vercel-build`
