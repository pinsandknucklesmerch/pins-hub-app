import type { Garment } from "@prisma/client"
import type { Design, DesignCostBreakdown } from "@/components/DesignCard"
import { PRINT_POSITIONS } from "@/components/DesignCard"

type FormatQuoteBaseParams = {
  designs: Design[]
  breakdowns: DesignCostBreakdown[]
  garments: Garment[]
  currency: string
}

type FormatUsQuoteParams = FormatQuoteBaseParams & {
  vatRate: number
}

type FormatDeliveryParams = {
  country: string
  deliveryTime: string
  boxCount: number
  costPerBox: number
  totalInclVat: number
  currency: string
}

function getPositionLabel(position: string) {
  return PRINT_POSITIONS.find((pos) => pos.value === position)?.label || position
}

function getItemLabel(design: Design, index: number) {
  return design.itemLabel?.trim() || `Item #${index + 1}`
}

export function formatEuQuoteCopy({
  designs,
  breakdowns,
  garments,
  currency
}: FormatQuoteBaseParams): string {
  return breakdowns
    .map((breakdown, index) => {
      const design = designs[index]
      if (!design) return null

      const garment = garments.find((item) => item.id === design.garmentId)
      const garmentCode = garment?.code || ""
      const garmentName = garment?.name || "No garment"
      const positionsText = Object.entries(design.positions)
        .filter(([, colorCount]) => colorCount > 0)
        .map(([position, colorCount]) => `${colorCount} Col ${getPositionLabel(position)}`)
        .join(", ")

      const subtotalExclVat =
        breakdown.baseCost + breakdown.pinsCost + breakdown.markupCost + breakdown.pkMarkupCost
      const unitExclVat = design.quantity > 0 ? subtotalExclVat / design.quantity : 0
      const subtotalInclVat = subtotalExclVat * 1.27 // or use vatRate if available

      return [
        `${getItemLabel(design, index)}:`,
        "",
        `${garmentCode} ${garmentName}${positionsText ? ` (${positionsText})` : ""}`,
        `${design.quantity} x ${currency}${unitExclVat.toFixed(2)} (excl vat) ea = ${currency}${subtotalInclVat.toFixed(2)}`
      ].join("\n")
    })
    .filter((entry): entry is string => Boolean(entry))
    .join("\n\n")
}

export function formatUsClientQuoteCopy({
  designs,
  breakdowns,
  garments,
  currency,
  vatRate
}: FormatUsQuoteParams): string {
  return breakdowns
    .map((breakdown, index) => {
      const design = designs[index]
      if (!design) return null

      const garment = garments.find((item) => item.id === design.garmentId)
      const garmentCode = garment?.code || ""
      const garmentName = garment?.name || "No garment"
      const positionsText = Object.entries(design.positions)
        .filter(([, colorCount]) => colorCount > 0)
        .map(([position, colorCount]) => `${colorCount}c ${getPositionLabel(position).toLowerCase()}`)
        .join(", ")

      const subtotalExclVat =
        breakdown.baseCost + breakdown.pinsCost + breakdown.markupCost + breakdown.pkMarkupCost
      const unitExclVat = design.quantity > 0 ? subtotalExclVat / design.quantity : 0
      const totalInclVat = subtotalExclVat * (1 + vatRate / 100)
      const vatAmount = totalInclVat - subtotalExclVat

      return [
        `${getItemLabel(design, index)}:`,
        "",
        `${garmentCode}  ${garmentName}${positionsText ? ` (${positionsText})` : ""}`,
        `${design.quantity} x ${currency}${unitExclVat.toFixed(2)} each (${currency}${subtotalExclVat.toFixed(2)} ex vat)`,
        `VAT = ${currency}${vatAmount.toFixed(2)}`,
        `TOTAL = ${currency}${totalInclVat.toFixed(2)}`
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
  currency
}: FormatDeliveryParams): string {
  return [
    `Delivery Helper`,
    "",
    `Delivery Country: ${country}`,
    `Delivery Time: ${deliveryTime}`,
    `Boxes: ${boxCount}`,
    `Cost Per Box: ${currency}${costPerBox.toFixed(2)} excl. VAT`,
    `Total Delivery Cost Incl. VAT: ${currency}${totalInclVat.toFixed(2)}`
  ].join("\n")
}

export function getQuoteFormatter(calculatorTitle: string) {
  if (calculatorTitle === "US Clients Calculator") {
    return formatUsClientQuoteCopy
  }

  return formatEuQuoteCopy
}
