# Pins Hub Design Context

Pins Hub is a compact internal-tool UI. Keep the visual language dense, operational, and dark, with restrained red accents and stable panel sizing.

## Shared Styling Sources
- `src/app/globals.css`
- `src/components/HubSidebar.tsx`
- `src/components/NavigationCard.tsx`
- `src/components/BackLink.tsx`
- `src/components/DesignCard.tsx`
- `src/components/theme/HubThemeProvider.tsx`
- `src/components/theme/ThemeToggle.tsx`

## Current Shell Pattern
- Home and hub pages use the same dark premium shell with compact spacing.
- Sidebar navigation is persistent inside the hub and only shows live routes.
- The app supports two local themes: `brand` and `classic`.
- Theme choice is stored in browser `localStorage` under `pins-hub-theme`.

## Reusable CSS Primitives
- `.hub-page-stack`
- `.hub-page-header`
- `.hub-page-header-title`
- `.hub-page-header-copy`
- `.hub-panel`
- `.hub-input`
- `.hub-button-primary`
- `.hub-button-secondary`
- `.hub-accent-button`
- `.hub-accent-panel`

## UI Expectations
- Preserve dark panels, zinc borders, red highlights, compact headers, and stable card heights.
- Keep calculator result surfaces mounted and visually stable.
- Favor practical tool layouts over marketing composition.
- Keep controls compact, readable, and responsive without layout shift.

## Do Not Change Via UI Work
- Calculator pricing logic
- VAT logic
- PK Tax formulas
- Referral reward logic removed/deferred
- Prisma models
- Database behavior
- Route structure
