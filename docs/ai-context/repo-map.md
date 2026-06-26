# Pins Hub Repo Map

This file summarizes the highest-impact files identified by Understand Anything. Use this as quick orientation before asking Codex or another assistant to modify the repo.

## Main Feature Areas

### Referrals

Core files:

- `src/app/hub/referrals/simulator.ts`
- `src/app/hub/referrals/actions.ts`
- `src/app/hub/referrals/ReferralsClient.tsx`

Key responsibilities:

- Referral rule simulation
- Reward calculations
- Scenario export/comparison
- Referral/customer server actions
- Loyalty point adjustments
- Referral status updates
- Scenario save/duplicate/delete

Important caution:

- Do not silently mutate loyalty points.
- Referral reward logic and loyalty transactions are business-sensitive.

### PK Tax

Core file:

- `src/app/hub/pk-tax/PkTaxCalculatorClient.tsx`

Key responsibilities:

- PK Tax pooled payout calculation
- Weighted allocation logic
- Johan separate handling
- Shannon contribution-only handling
- Factory invoice output
- GBP/ZAR formatting and copy output

Important caution:

- Do not alter payout weights, eligibility rules, factory invoice math, or redistribution logic unless explicitly requested.

### Calculators

Core files:

- `src/components/DesignCard.tsx`
- `src/app/hub/calculators/copyFormatters.ts`

Key responsibilities:

- Garment/design input cards
- Print and embroidery cost calculation
- Garment selector behavior
- EU/US/UK quote copy formatting
- Delivery copy formatting

Important caution:

- Do not alter pricing, VAT, production cost, markup, or copy rules unless explicitly requested.

### Garments

Core file:

- `src/app/hub/garments/actions.ts`

Key responsibilities:

- Add garment
- Update garment details
- Delete garment
- Normalize tags, codes, text, and numeric values
- Revalidate garment/calculator surfaces

Important caution:

- Garment changes affect calculator reference data.

### Quick Reference

Core file:

- `src/app/hub/reference/ReferenceClient.tsx`

Key responsibilities:

- Static operational reference copy
- Saved local messages
- Supplier/logistics email copy
- Local storage parsing and updates

Important caution:

- Saved messages are browser-local only.

### Layout / Navigation

Core file:

- `src/components/HubSidebar.tsx`

Key responsibilities:

- Main sidebar navigation
- Active state detection
- Theme toggle placement
- Staging updates panel placement

Important caution:

- Sidebar should only show usable routes.

### Database

Core file:

- `src/lib/db.ts`

Key responsibilities:

- Prisma client setup
- PostgreSQL connection
- Runtime database guardrails

Important caution:

- PostgreSQL only.
- Do not reintroduce SQLite.
- Do not commit secrets or database URLs.
