# Pins Hub Product Context

## Register
product

## Product
Pins Hub is an internal operations app for Pins & Knuckles. It combines pricing calculators, garment reference data, PK Tax calculations, and quick operational copy in one compact hub.

## Users
- Pins & Knuckles sales and operations users preparing quotes.
- Internal users checking garment data, delivery guidance, tax calculations, and reusable supplier/customer copy.

## Purpose
The app should make repeated internal workflows faster and less error-prone. Calculator surfaces must prioritize stable totals, clear copy behavior, and practical controls over decorative presentation.

## Design Principles
- Keep the UI dense, dark, and operational.
- Preserve red accents, zinc borders, compact panels, and stable calculator card heights.
- Favor direct tool controls and readable breakdowns over marketing-style layout.
- Keep result panels visually stable while inputs change.
- Reuse shared hub styling primitives and route-level conventions.

## Constraints
- Do not change calculator pricing, VAT, PK Tax, Prisma, or database behavior during UI-only work.
- Preserve established wording such as `Back to Hub` and the current `Refferals` hub card spelling unless explicitly requested.
- PostgreSQL is the only supported database target.

## References
- Visual system notes: `docs/ai-context/DESIGN.md`
- Broader project notes: `docs/ai-context/PROJECT_CONTEXT.md`
