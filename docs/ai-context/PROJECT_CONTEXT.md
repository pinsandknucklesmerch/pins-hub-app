# Pins Hub Project Context

## Overview
`pins-hub` internal operations app Pins & Knuckles. combines pricing calculators, garment reference data, PK Tax calculations, referral planning tools, reusable operational copy. current direction compact internal SaaS UI rather marketing-style layout.

## Stack
- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Prisma
- PostgreSQL / Neon

## Active Routes
- `/`
- `/hub/calculators`
- `/hub/calculators/eu`
- `/hub/calculators/eu/standard`
- `/hub/calculators/eu/us-clients`
- `/hub/calculators/uk`
- `/hub/calculators/uk/trade`
- `/hub/commercial-invoices`
- `/hub/garments`
- `/hub/pk-tax`
- `/hub/referrals`
- `/hub/reference`
- `/ref/[code]`

## Navigation And Theme
- hub uses compact sidebar navigation in `src/components/HubSidebar.tsx`.
- Sidebar items currently map `Home`, `Price Calculators`, `Commercial Invoices`, `Garment Directory`, `PK Tax`, `Referrals`, and `Quick Reference`.
- Only usable routes appear in sidebar.
- app supports two persistent local themes: `brand` `classic`.
- Theme state managed in `src/components/theme/HubThemeProvider.tsx`.
- Theme selection stored in browser `localStorage` under `pins-hub-theme`.
- visible theme control compact switch in `src/components/theme/ThemeToggle.tsx`.

## Current UI Direction
- Main styling lives in `src/app/globals.css`.
- Shared page density standardized with:
  - `.hub-page-stack`
  - `.hub-page-header`
  - `.hub-page-header-title`
  - `.hub-page-header-copy`
- Shared navigation menu cards use `src/components/NavigationCard.tsx`.
- app should stay dense, practical, dark across themes.

## Home
- Current surface dark hub shell sidebar, compact hero, grid tool cards.
- home screen currently advertises `6 Live Tools`.
- Home cards are:
  - `Price Calculators`
  - `Garment Directory`
  - `PK Tax`
  - `Refferals`
  - `Quick Reference`

## Price Calculators
- Menu files:
  - `src/app/hub/calculators/page.tsx`
  - `src/app/hub/calculators/CalculatorPageContent.tsx`
  - `src/app/hub/calculators/CalculatorLoading.tsx`
- calculators menu presents:
  - `EU` as active
  - `UK` as reserved, with a live `UK Trade Calculator` underneath the UK route

### EU Calculator
- Main files:
  - `src/app/hub/calculators/CalculatorClient.tsx`
  - `src/app/hub/calculators/copyFormatters.ts`
  - `src/app/hub/calculators/displayStandards.ts`
  - `src/app/hub/calculators/data.ts`
- Pricing rules preserve:
  - `VAT` hardcoded at `27%`
  - `PK Markup` per-unit feeds customer pricing before VAT
  - Delivery helper logic sales helper only must not affect main totals
- Current UI features:
  - Multi-item design builder
  - Copy-to-clipboard quote generation
  - Shared `Click to Copy` customer quote action on the main price card
  - Delivery costs helper
  - Box Capacity Guide modal
  - Sticky breakdown / total panel
  - Shared breakdown row formatting helpers for labels like `Garment Base Price`, `Front Print (1 col)`, `Total Unit Cost (excl VAT)`, and `/unit` value formatting

### UK Trade Calculator
- Route: `/hub/calculators/uk/trade`
- Main files:
  - `src/app/hub/calculators/uk/trade/page.tsx`
  - `src/app/hub/calculators/uk/trade/UkTradeCalculatorClient.tsx`
  - `src/app/hub/calculators/uk/trade/UkTradeDesignCard.tsx`
  - `src/app/hub/calculators/uk/trade/data.ts`
  - `src/app/hub/calculators/uk/tradeScreenPrintData.ts`
- Current behavior:
  - UK trade screen-print pricing in GBP
  - Uses UK quantity tiers per-colour setup charges
  - Minimum quantity `50`
  - Summary shows garment cost, print cost, setup cost, total cost, cost per unit
  - Main total card follows the shared `Click to Copy` quote action pattern
  - Breakdown rows use the shared calculator display helpers where applicable

## Garment Directory
- Route: `/hub/garments`
- Files:
  - `src/app/hub/garments/page.tsx`
  - `src/app/hub/garments/GarmentDirectoryClient.tsx`
  - `src/app/hub/garments/data.ts`
  - `src/app/hub/garments/actions.ts`
- Notes:
 - Directory data cached behind `garment-directory` tag
 - Garment mutations revalidate garment directory calculator reference surfaces

## Commercial Invoices
- Route: `/hub/commercial-invoices`
- Files:
 - `src/app/hub/commercial-invoices/page.tsx`
 - `src/app/hub/commercial-invoices/CommercialInvoiceClient.tsx`
 - `src/app/hub/commercial-invoices/actions.ts`
 - `src/app/hub/commercial-invoices/data.ts`
 - `src/app/hub/commercial-invoices/types.ts`
- Current behavior:
 - Manual-first commercial invoice builder for internal shipment paperwork
 - Sender, receiver, duties payer, and print location start blank/unselected
 - Sender/receiver dropdowns currently use static starter addresses in the client: `EPCC` => `The Embroidered & Printed Clothing Company`, `Sportimadok` => `Sportimadok.hu kft`, and `AAA Vans Ireland`
 - Selecting a starter address copies values into editable invoice fields; editing copied fields must not mutate starter source data
 - Excel export is primary editable output using `exceljs`
 - PDF export is secondary final/shareable output using `jspdf` and `jspdf-autotable`
 - Exports include invoice details, sender/receiver snapshots, line items, totals, print location declaration, and blank signature fields
 - `Print Location` means where the order was printed: `United Kingdom` or `Hungary`
 - `Country of Origin` means where the blank garment/product was manufactured, not where it was printed
 - Commodity code is product/material/type based, not brand based
 - Country of origin is garment/product specific and stays editable per line item
 - Variable COO support is local/static metadata: `Gildan` line items show a COO dropdown with `Bangladesh`, `Honduras`, `Nicaragua`, `Haiti`, plus `Other / manual`; `Westford Mill W101` auto-fills fixed known COO `China` when blank but remains editable; unknown products show a normal blank COO input and helper copy to check garment label or supplier spec sheet
 - Save/load persists editable invoice snapshots when the commercial invoice database models are available
 - Do not turn this route into a full accounting system or change calculator pricing logic from here

## PK Tax
- Route: `/hub/pk-tax`
- Files:
  - `src/app/hub/pk-tax/page.tsx`
  - `src/app/hub/pk-tax/PkTaxCalculatorClient.tsx`
- Notes:
  - Manual-entry monthly calculator
  - Includes guide modal accordion-based sections
  - Not Netsuite Monday sync surface
  - Keep payout shared-pool logic unchanged unless explicitly requested

## Referrals
- Route: `/hub/referrals`
- reference copy blocks

```ts
type SavedMessage = { id: string title: string body: string createdAt: string updatedAt: string }
```

- Saved messages browser-local only stored in `localStorage`
- Storage key: `pins-hub-reference-saved-messages`
- Snapshot stability `useSyncExternalStore` matters; empty snapshot should stay stable shared array reference

## Database Runtime
- Prisma schema: `prisma/schema.prisma`
- Database is PostgreSQL only
- `src/lib/db.ts` requires `DATABASE_URL` rejects `file:` URLs
- On Vercel, `DATABASE_URL` must Neon pooled URL must not point localhost
- Use `DIRECT_DATABASE_URL` migration access available

## Seed State
- Seed files:
  - `prisma/seed.ts`
  - `prisma/seed-data.ts`
- Current calculator profiles:
  - `STANDARD_EU`
  - `US_CLIENTS`

## Wording Constraints
Preserve labels:
- `Back Hub`
- `Back Calculators`
- `Back Regions`
- `Refferals` remains intentionally misspelled on home card now

## Verification Commands

```bash
rtk npm run lint
rtk tsc
rtk npm run vercel-build
```
