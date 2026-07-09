# Pins Hub Visual Repo Map

This file gives a compact visual overview of the main Pins Hub feature areas. It is intentionally split into smaller Mermaid diagrams so it stays readable in Obsidian, VS Code, and GitHub.

## 1. System Overview

```mermaid
flowchart TB
  Home["Home<br/>src/app/page.tsx"]
  Sidebar["Sidebar<br/>src/components/HubSidebar.tsx"]
  Theme["Theme<br/>src/components/theme/*"]

  Calculators["Calculators"]
  Invoices["Commercial Invoices"]
  Garments["Garment Directory"]
  PkTax["PK Tax"]
  Reference["Quick Reference"]
  Database["Database<br/>Prisma + Postgres"]

  Home --> Sidebar
  Sidebar --> Theme

  Sidebar --> Calculators
  Sidebar --> Invoices
  Sidebar --> Garments
  Sidebar --> PkTax
  Sidebar --> Reference

  Invoices --> Database
  Garments --> Database
```

## 2. Calculators

```mermaid
flowchart TB
  CalculatorPage["Calculator Pages"]
  CalculatorData["Calculator Data<br/>src/app/hub/calculators/data.ts"]
  DesignCard["Shared Design Card<br/>src/components/DesignCard.tsx"]
  CopyFormatters["Copy Formatters<br/>copyFormatters.ts"]

  EuStandard["EU Standard"]
  UkTrade["UK Trade"]
  UsClients["US Clients"]

  CalculatorPage --> EuStandard
  CalculatorPage --> UkTrade
  CalculatorPage --> UsClients

  EuStandard --> DesignCard
  UkTrade --> DesignCard
  UsClients --> DesignCard

  DesignCard --> CalculatorData
  CopyFormatters --> DesignCard
```

## 3. Commercial Invoices

```mermaid
flowchart TB
  InvoicePage["Commercial Invoice Page"]
  InvoiceClient["CommercialInvoiceClient.tsx"]
  InvoiceActions["actions.ts"]
  InvoiceData["src/app/hub/data/*"]
  Database["src/lib/db.ts"]

  InvoicePage --> InvoiceClient
  InvoiceClient --> InvoiceActions
  InvoiceActions --> InvoiceData
  InvoiceActions --> Database
```

## 4. Garments

```mermaid
flowchart TB
  GarmentPage["Garment Directory Page"]
  GarmentClient["GarmentDirectoryClient.tsx"]
  GarmentActions["garments/actions.ts"]
  GarmentData["garments/data.ts"]
  CalculatorData["calculators/data.ts"]
  Database["src/lib/db.ts"]

  GarmentPage --> GarmentClient
  GarmentClient --> GarmentActions
  GarmentActions --> GarmentData
  GarmentActions --> CalculatorData
  GarmentData --> Database
```

## 5. Referrals

Removed/deferred. `/hub/referrals`, `/ref/[code]`, referral route files, and referral/loyalty Prisma models are no longer active.

## 6. PK Tax and Quick Reference

```mermaid
flowchart TB
  PkTaxPage["PK Tax Page"]
  PkTaxClient["PkTaxCalculatorClient.tsx"]

  ReferencePage["Quick Reference Page"]
  ReferenceClient["ReferenceClient.tsx"]
  ReferenceData["referenceData.ts"]
  LocalStorage["Browser Local Storage"]

  PkTaxPage --> PkTaxClient

  ReferencePage --> ReferenceClient
  ReferenceClient --> ReferenceData
  ReferenceClient --> LocalStorage
```

## 7. Feature Hotspots

```mermaid
flowchart TB
  PkTax["PK Tax<br/>Large calculator"]
  Calculators["Calculators<br/>Pricing + quote copy"]
  Garments["Garments<br/>Feeds calculator data"]
  Invoices["Commercial Invoices<br/>Manual-first invoice tool"]
  Reference["Quick Reference<br/>Operational notes"]
  Database["Database<br/>Prisma + Postgres"]

  Garments --> Calculators
  Calculators --> Invoices
  Database --> Garments
  Database --> Invoices
```
