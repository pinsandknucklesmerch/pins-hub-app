import type { Garment } from "@prisma/client"

import {
  DESIGN_EMBROIDERY_ITEMS,
  type Design,
  type DesignCostBreakdown
} from "@/components/DesignCard"

import { getBreakdownItemLabel, getPrintPositionLabel } from "./displayStandards"

type FormatQuoteBaseParams = {
  designs: Design[]
  breakdowns: DesignCostBreakdown[]
  garments: Garment[]
  currency: string
}

type FormatUsQuoteParams = FormatQuoteBaseParams & {
  vatRate: number
}

type FormatUkTradeQuoteParams = {
  designs: Array<{
    garmentId?: string
    quantity: number
    positions: Record<string, number>
    itemLabel?: string
  }>
  breakdowns: Array<{
    totalCost: number
    hasValidPrice: boolean
  }>
  garments: Array<{ id: string; code: string; brandName: string; name: string; color: string }>
  currency: string
}

type FormatDeliveryParams = {
  country: string
  deliveryTime: string
  boxCount: number
  costPerBox: number
  totalInclVat: number
  currency: string
}

function getCustomerSubtotalExclVat(breakdown: DesignCostBreakdown) {
  return (
    breakdown.baseCost +
    breakdown.pinsCost +
    breakdown.markupCost +
    breakdown.pkMarkupCost +
    breakdown.embroideryCost +
    breakdown.digitizingFee
  )
}

function formatDigitizingFeeLine(breakdown: DesignCostBreakdown, currency: string) {
  if (breakdown.digitizingFee <= 0) {
    return null
  }

  return `Digitizing Fee = ${currency}${formatCompactAmount(breakdown.digitizingFee)} ex vat`
}

function formatEuDigitizingFeeLine(breakdown: DesignCostBreakdown, currency: string) {
  if (breakdown.digitizingFee <= 0) {
    return null
  }

  return `Digitizing fee = ${currency}${formatCompactAmount(breakdown.digitizingFee)} (incl vat)`
}

function formatCompactAmount(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)
}

function formatEmbroiderySummary(design: Pick<Design, "embroideryItems">) {
  return DESIGN_EMBROIDERY_ITEMS.flatMap((item) => {
    const size = design.embroideryItems?.[item.key]

    if (!size) {
      return []
    }

    return item.label
  }).join(", ")
}

function formatPositionSummary(design: Design, variant: "eu" | "us") {
  const printSummary = Object.entries(design.positions)
    .filter(([, colorCount]) => colorCount > 0)
    .map(([position, colorCount]) => {
      const label = getPrintPositionLabel(position)

      if (variant === "us") {
        return `${colorCount}c ${label.toLowerCase()}`
      }

      return `${colorCount} Col ${label}`
    })
  const embroiderySummary = formatEmbroiderySummary(design)

  return [...printSummary, embroiderySummary].filter(Boolean).join(", ")
}

function formatGarmentSummary(
  garment: { code?: string; brandName?: string; name?: string; color?: string } | undefined,
  positionsText: string,
  suffix = "",
) {
  const garmentParts = [
    garment?.code?.trim(),
    garment?.brandName?.trim(),
    garment?.name?.trim(),
    garment?.color?.trim(),
  ].filter(Boolean)
  const garmentSummary = garmentParts.length > 0 ? garmentParts.join(" ") : "No garment"

  return `${garmentSummary}${positionsText ? ` (${positionsText}${suffix})` : ""}`
}

export function formatEuQuoteCopy({
  designs,
  breakdowns,
  garments,
  currency,
}: FormatQuoteBaseParams): string {
  return breakdowns
    .map((breakdown, index) => {
      const design = designs[index]
      if (!design) return null

      const garment = garments.find((item) => item.id === design.garmentId)
      const positionsText = formatPositionSummary(design, "eu")
      const subtotalExclVat = getCustomerSubtotalExclVat(breakdown)
      const digitizingFeeLine = formatEuDigitizingFeeLine(breakdown, currency)
      const unitExclVat = design.quantity > 0 ? subtotalExclVat / design.quantity : 0
      const totalInclVat = subtotalExclVat * 1.27

      return [
        `${getBreakdownItemLabel(design.itemLabel, index)}:`,
        "",
        formatGarmentSummary(garment, positionsText),
        ...(digitizingFeeLine ? [digitizingFeeLine] : []),
        `${design.quantity} x ${currency}${unitExclVat.toFixed(2)} (excl vat) ea = ${currency}${totalInclVat.toFixed(2)}`,
      ].filter(Boolean).join("\n\n")
    })
    .filter((entry): entry is string => Boolean(entry))
    .join("\n\n")
}

export function formatUsClientQuoteCopy({
  designs,
  breakdowns,
  garments,
  currency,
  vatRate,
}: FormatUsQuoteParams): string {
  return breakdowns
    .map((breakdown, index) => {
      const design = designs[index]
      if (!design) return null

      const garment = garments.find((item) => item.id === design.garmentId)
      const positionsText = formatPositionSummary(design, "us")
      const subtotalExclVat = getCustomerSubtotalExclVat(breakdown)
      const digitizingFeeLine = formatDigitizingFeeLine(breakdown, currency)
      const unitExclVat = design.quantity > 0 ? subtotalExclVat / design.quantity : 0
      const totalInclVat = subtotalExclVat * (1 + vatRate / 100)
      const vatAmount = totalInclVat - subtotalExclVat

      return [
        `${getBreakdownItemLabel(design.itemLabel, index)}:`,
        "",
        formatGarmentSummary(garment, positionsText, " + base"),
        ...(digitizingFeeLine ? [digitizingFeeLine] : []),
        `${design.quantity} x ${currency}${unitExclVat.toFixed(2)} each (${currency}${subtotalExclVat.toFixed(2)} ex vat)`,
        `VAT = ${currency}${vatAmount.toFixed(2)}`,
        `TOTAL = ${currency}${totalInclVat.toFixed(2)}`,
      ].join("\n")
    })
    .filter((entry): entry is string => Boolean(entry))
    .join("\n\n")
}

export function formatUkTradeQuoteCopy({
  designs,
  breakdowns,
  garments,
  currency,
}: FormatUkTradeQuoteParams): string {
  return breakdowns
    .map((breakdown, index) => {
      const design = designs[index]
      if (!design || !breakdown.hasValidPrice) return null

      const garment = garments.find((item) => item.id === design.garmentId)
      const positionsText = formatPositionSummary(design, "eu")
      const unitExclVat = design.quantity > 0 ? breakdown.totalCost / design.quantity : 0

      return [
        `${getBreakdownItemLabel(design.itemLabel, index)}:`,
        "",
        formatGarmentSummary(garment, positionsText),
        `${design.quantity} x ${currency}${unitExclVat.toFixed(2)} each (${currency}${breakdown.totalCost.toFixed(2)} ex vat)`,
      ].join("\n")
    })
    .filter((entry): entry is string => Boolean(entry))
    .join("\n\n")
}

export function formatDeliveryCopy({
  country,
  deliveryTime,
  boxCount,
  costPerBox,
  totalInclVat,
  currency,
}: FormatDeliveryParams): string {
  return [
    "Delivery Helper",
    "",
    `Delivery Country: ${country}`,
    `Delivery Time: ${deliveryTime}`,
    `Boxes: ${boxCount}`,
    `Cost Per Box: ${currency}${costPerBox.toFixed(2)} excl. VAT`,
    `Total Delivery Cost Incl. VAT: ${currency}${totalInclVat.toFixed(2)}`,
  ].join("\n")
}

export function getQuoteFormatter(calculatorTitle: string) {
  if (calculatorTitle === "US Clients Calculator") {
    return formatUsClientQuoteCopy
  }

  return formatEuQuoteCopy
}
