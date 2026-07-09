# Pins Hub UI Manual Update Guide

Use this document when asking ChatGPT or another editor to make manual UI-only changes in Pins Hub.

It is designed to answer:

- where colors are defined
- where shared container/card styles live
- where page header spacing is controlled
- where sidebar and branding are controlled
- which files own specific visual areas
- what should not be changed

This guide is for UI/UX updates only.

## Non-Negotiable Rules

Do not change:

- calculator pricing logic
- VAT logic
- PK Tax calculations
- removed referral logic
- database logic
- Prisma models
- route structure
- cache invalidation logic

Safe changes:

- colors
- shadows
- spacing
- borders
- typography
- icons
- gradients
- layout density
- card styling
- search bar styling
- button styling
- table styling
- accordion styling

## Project Structure For UI Work

Main UI files:

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
    hub/
      layout.tsx
      loading.tsx
      calculators/
        page.tsx
        CalculatorPageContent.tsx
        CalculatorClient.tsx
        CalculatorLoading.tsx
        eu/page.tsx
        uk/
          page.tsx
          trade/
            page.tsx
            UkTradeCalculatorClient.tsx
            UkTradeDesignCard.tsx
            data.ts
        data.ts
      garments/
        page.tsx
        loading.tsx
        GarmentDirectoryClient.tsx
      pk-tax/
        page.tsx
        PkTaxCalculatorClient.tsx
      referrals/ (removed)
        page.tsx
        loading.tsx
        ReferralsClient.tsx
        AccordionSection.tsx
        ReferralRuleCard.tsx
        ReferralTestCaseCard.tsx
        ReferralSimulationSummary.tsx
        ReferralTabs.tsx
      reference/
        page.tsx
        ReferenceClient.tsx
        referenceData.ts
  components/
    BackLink.tsx
    BrandLogo.tsx
    HubSidebar.tsx
    NavigationCard.tsx
    DesignCard.tsx
    theme/
      HubThemeProvider.tsx
      ThemeToggle.tsx
  assets/
    P&K_LOGO.png
    P&K_ICON.png
```

## Theme System

### Where theme colors live

Primary theme tokens live in:

- `src/app/globals.css`

Look for:

- `html.theme-brand`
- `html.theme-classic`

These blocks define theme-level variables such as:

- `--color-bg`
- `--color-surface`
- `--color-surface-muted`
- `--color-surface-elevated`
- `--color-border`
- `--color-text`
- `--color-text-muted`
- `--color-text-soft`
- `--color-accent`
- `--color-info`
- `--shadow-card`
- `--shadow-soft`
- `--shadow-active`
- `--shadow-info`

If you want to change the overall brand or neutral palette, start here first.

### Theme state logic

Theme persistence and theme switching live in:

- `src/components/theme/HubThemeProvider.tsx`
- `src/components/theme/ThemeToggle.tsx`

Use these files only if you need to change:

- theme names
- localStorage behavior
- theme toggle UI

Do not touch these for simple color changes.

## Shared Design System Primitives

These are the most important shared CSS classes in `src/app/globals.css`.

### Core containers

- `.hub-panel`
  - main premium card/panel surface
- `.hub-panel-subtle`
  - lighter secondary surface
- `.hub-glass`
  - glass/blurred shell, used for premium sidebar and hero-style surfaces

### Navigation / buttons

- `.hub-back-link`
  - shared back button style
- `.hub-button-primary`
  - red primary action button
- `.hub-button-secondary`
  - neutral secondary button
- `.hub-accent-button`
  - blue-accent action button
- `.hub-accent-panel`
  - blue-accent info/result panel

### Inputs / controls

- `.hub-input`
  - shared text input and textarea styling
- `.hub-theme-switch`
  - theme toggle track
- `.hub-theme-switch-thumb`
  - theme toggle knob

### Layout / spacing

- `.hub-page-stack`
  - standard vertical page spacing
- `.hub-page-header`
  - page header container
- `.hub-page-header-title`
  - page title
- `.hub-page-header-copy`
  - page subtitle/description

### Navigation / cards

- `.hub-nav-card`
  - sidebar navigation item shell
- `.hub-nav-card-active`
  - active sidebar item
- `.hub-tool-card`
  - used conceptually by navigation/tool cards

### Data-heavy UI

- `.hub-kpi-card`
  - KPI / summary card
- `.hub-kpi-card-info`
  - blue-accent KPI card
- `.hub-kpi-value`
  - large KPI number
- `.hub-table-shell`
  - outer table container
- `.hub-table-head`
  - table header styling
- `.hub-table-row`
  - standard hoverable row styling
- `.hub-search-shell`
  - shared search bar container shell

## Branding And Logo Files

Brand assets live in:

- `src/assets/P&K_LOGO.png`
- `src/assets/P&K_ICON.png`

Shared logo rendering lives in:

- `src/components/BrandLogo.tsx`

Use this file if you need to change:

- logo sizes
- logo proportions
- compact vs full logo behavior

## Shared Navigation / Shell Components

### Sidebar

File:

- `src/components/HubSidebar.tsx`

Change this file for:

- top logo placement
- sidebar spacing
- nav item order
- hiding/showing links
- logo prominence
- theme toggle placement

Do not add unavailable links here.

### Home tool cards

File:

- `src/components/NavigationCard.tsx`

Change this file for:

- tool card padding
- card hover states
- badge styling
- icon block styling
- card border/shadow behavior

### Shared back button

File:

- `src/components/BackLink.tsx`

Change this file only if you want all back buttons to look different globally.

## Page-Level Ownership Map

### Home

File:

- `src/app/page.tsx`

Owns:

- hero content
- hero logo placement
- home intro spacing
- home grid of tool cards

If you want to change:

- home hero height
- logo placement on home
- home card grid spacing
- subtitle under the logo

edit this file.

### Hub layout

File:

- `src/app/hub/layout.tsx`

Owns:

- sidebar/main content spacing
- overall hub page width
- gap between sidebar and content

If pages feel too wide, too narrow, or too separated, edit this file.

### Calculator route shells

Files:

- `src/app/hub/calculators/page.tsx`
- `src/app/hub/calculators/eu/page.tsx`
- `src/app/hub/calculators/uk/page.tsx`
- `src/app/hub/calculators/uk/trade/page.tsx`
- `src/app/hub/calculators/CalculatorPageContent.tsx`

Own:

- page headers
- back button placement
- card grids on calculator index pages

### Standard EU and US Clients calculators

Main file:

- `src/app/hub/calculators/CalculatorClient.tsx`
- `src/app/hub/calculators/displayStandards.ts`
- `src/app/hub/calculators/copyFormatters.ts`

Shared design subcomponent:

- `src/components/DesignCard.tsx`

Change these files for:

- item configuration layout
- delivery section styling
- results card styling
- breakdown accordion styling
- print position button appearance
- segmented controls
- search/dropdown styling inside the calculator

Preserve pricing math. Breakdown label formatting and customer quote copy can be standardized through the shared display and formatter helpers.

### UK Trade Calculator

Main files:

- `src/app/hub/calculators/uk/trade/UkTradeCalculatorClient.tsx`
- `src/app/hub/calculators/uk/trade/UkTradeDesignCard.tsx`

Change files for:

- GBP totals layout
- item card spacing
- breakdown panel styling
- setup-cost presentation
- trade calculator control density
- keep the shared customer quote card pattern and breakdown row formatting aligned with the EU calculators

### Garment Directory

Files:

- `src/app/hub/garments/page.tsx`
- `src/app/hub/garments/GarmentDirectoryClient.tsx`

Change these for:

- search bar styling
- table shell
- sticky header behavior
- row padding
- badge/tag styling
- add/edit/delete button styling
- modal surface styling

### PK Tax

Files:

- `src/app/hub/pk-tax/page.tsx`
- `src/app/hub/pk-tax/PkTaxCalculatorClient.tsx`

Change these for:

- KPI card appearance
- finance dashboard styling
- results table styling
- input section styling
- pool breakdown panel styling

Do not change PK Tax formulas.

### Referrals
Removed/deferred. Do not document `/hub/referrals` as active. Historical notes may reference removed files only.

### Quick Reference

Files:

- `src/app/hub/reference/ReferenceClient.tsx`
- `src/app/hub/reference/referenceData.ts`

Change `ReferenceClient.tsx` for:

- header spacing
- search/filter placement
- accordion card styling
- saved message UI
- email card styling

Change `referenceData.ts` only for static content items such as billing, delivery, imports, etc.

Do not move localStorage logic into `referenceData.ts`.

## Where To Change Specific Things

### 1. Update global colors

Edit:

- `src/app/globals.css`

Look for:

- `html.theme-brand`
- `html.theme-classic`

### 2. Update page header spacing everywhere

Edit:

- `src/app/globals.css`

Look for:

- `.hub-page-header`
- `.hub-page-header-title`
- `.hub-page-header-copy`
- `.hub-page-stack`

### 3. Update sidebar container position or width

Edit:

- `src/components/HubSidebar.tsx`
- `src/app/hub/layout.tsx`

Key places:

- `lg:w-[...]`
- `lg:sticky`
- `top-...`
- outer `max-w-[...]`

### 4. Update home hero position / compactness

Edit:

- `src/app/page.tsx`

Look for:

- hero `<section>`
- `BrandLogo`
- hero subtitle paragraph
- top-level page padding classes

### 5. Update search bar styling across multiple pages

Primary global base:

- `src/app/globals.css`
- `.hub-input`
- `.hub-search-shell`

Page-specific search implementations:

- `src/app/hub/reference/ReferenceClient.tsx`
- `src/app/hub/garments/GarmentDirectoryClient.tsx`
- `src/components/DesignCard.tsx`
- `src/app/hub/calculators/CalculatorClient.tsx`

### 6. Update card hover / elevation globally

Edit:

- `src/app/globals.css`
- `src/components/NavigationCard.tsx`

Look for:

- `transform`
- `box-shadow`
- hover border colors

### 7. Update back button styling everywhere

Edit:

- `src/components/BackLink.tsx`
- `.hub-back-link` in `src/app/globals.css`

### 8. Update calculator result cards

Edit:

- `src/app/hub/calculators/CalculatorClient.tsx`

Search for:

- `Production Costs`
- `Pins Price`
- `Breakdown`
- `Delivery Summary`

### 9. Update garment table row density / header

Edit:

- `src/app/hub/garments/GarmentDirectoryClient.tsx`

Search for:

- `<table`
- `<thead`
- `<tbody`
- `No garments found`

### 10. Update accordion appearance

Files:

- `src/app/hub/reference/ReferenceClient.tsx`
- `src/app/hub/referrals/ (removed)AccordionSection.tsx`
- calculator breakdown areas in `CalculatorClient.tsx`
- PK Tax breakdown areas in `PkTaxCalculatorClient.tsx`

## Useful Search Terms

If using ChatGPT for manual edits, tell it to search for these exact phrases.

### Theme / colors

- `html.theme-brand`
- `html.theme-classic`
- `--color-accent`
- `--color-info`
- `.hub-panel`

### Spacing / headers

- `.hub-page-header`
- `.hub-page-stack`
- `.hub-page-header-title`
- `.hub-page-header-copy`

### Home

- `BrandLogo`
- `Pins Hub`
- `Open Tool`

### Sidebar

- `navItems`
- `HubSidebar`
- `BrandLogo compact`
- `ThemeToggle compact`

### Calculator

- `Production Costs`
- `Pins Price`
- `Breakdown`
- `Delivery Costs`
- `Box Capacity Guide`

### Garments

- `Search by code, brand, color, name, or tag`
- `No garments found`
- `Add Garment`

### PK Tax

- `Factory Invoice Total`
- `Total shared sales team pool`
- `Results`
- `Pool & Allocation Breakdown`

### Referrals
Removed/deferred. Do not document `/hub/referrals` as active. Historical notes may reference removed files only.

### Quick Reference

- `Custom Message`
- `Supplier & Logistics Emails`
- `pins-hub-reference-saved-messages`

## Safe Prompt Template For ChatGPT

Use this when asking ChatGPT for manual UI edits:

```text
This is a UI-only update for Pins Hub.

Do not change:
- business logic
- calculations
- removed referral logic
- PK Tax logic
- Prisma models
- database behavior
- routes

Relevant files:
- src/app/globals.css
- [add the exact page/component files here]

Please update only:
- [colors / spacing / card styles / table styling / header density / logo placement / etc.]

If changing colors, start in:
- html.theme-brand
- html.theme-classic

If changing shared spacing, start in:
- .hub-page-header
- .hub-page-stack
- .hub-page-header-title
- .hub-page-header-copy

If changing navigation branding, use:
- src/components/HubSidebar.tsx
- src/components/BrandLogo.tsx

If changing back button styling, use:
- src/components/BackLink.tsx
- .hub-back-link in globals.css
```

## Final Reminder

When asking for manual edits:

1. name the exact page or component
2. say whether the change is global or page-specific
3. tell ChatGPT whether to edit:
   - `globals.css`
   - shared components
   - page-level client file
4. explicitly repeat:
   - `Do not change logic`
