import {
  UK_TRADE_NECK_PRINT_STANDARD_POSITION,
  UK_TRADE_NECK_PRINT_TRANSFER_POSITION,
  type UkTradePrintPositionId,
} from "./trade/types"

export const UK_TRADE_SCREEN_SETUP_PER_SCREEN = 20

export const UK_TRADE_SCREEN_PRINT_QUANTITY_TIERS = [
  50,
  100,
  200,
  500,
  1000,
  2500,
  5000,
  10000,
] as const

export const UK_TRADE_SCREEN_PRINT_COLOUR_COUNTS = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
] as const

export type UkTradeScreenPrintQuantityTier =
  (typeof UK_TRADE_SCREEN_PRINT_QUANTITY_TIERS)[number]

export type UkTradeScreenPrintColourCount =
  (typeof UK_TRADE_SCREEN_PRINT_COLOUR_COUNTS)[number]

type UkTradeScreenPrintPriceRow = {
  colorCount: UkTradeScreenPrintColourCount
  pricesByTier: Record<UkTradeScreenPrintQuantityTier, number>
}

type UkTradeTierPriceMap = Record<UkTradeScreenPrintQuantityTier, number>

export const ukTradeScreenPrintPrices: readonly UkTradeScreenPrintPriceRow[] = [
  {
    colorCount: 1,
    pricesByTier: {
      50: 1.47,
      100: 0.93,
      200: 0.75,
      500: 0.68,
      1000: 0.6,
      2500: 0.59,
      5000: 0.58,
      10000: 0.56,
    },
  },
  {
    colorCount: 2,
    pricesByTier: {
      50: 1.63,
      100: 1.08,
      200: 0.88,
      500: 0.79,
      1000: 0.7,
      2500: 0.68,
      5000: 0.66,
      10000: 0.63,
    },
  },
  {
    colorCount: 3,
    pricesByTier: {
      50: 1.79,
      100: 1.23,
      200: 1.01,
      500: 0.9,
      1000: 0.8,
      2500: 0.77,
      5000: 0.74,
      10000: 0.7,
    },
  },
  {
    colorCount: 4,
    pricesByTier: {
      50: 1.95,
      100: 1.38,
      200: 1.14,
      500: 1.01,
      1000: 0.9,
      2500: 0.86,
      5000: 0.82,
      10000: 0.77,
    },
  },
  {
    colorCount: 5,
    pricesByTier: {
      50: 2.11,
      100: 1.53,
      200: 1.27,
      500: 1.12,
      1000: 1,
      2500: 0.95,
      5000: 0.9,
      10000: 0.84,
    },
  },
  {
    colorCount: 6,
    pricesByTier: {
      50: 2.27,
      100: 1.68,
      200: 1.4,
      500: 1.23,
      1000: 1.1,
      2500: 1.04,
      5000: 0.98,
      10000: 0.91,
    },
  },
  {
    colorCount: 7,
    pricesByTier: {
      50: 2.43,
      100: 1.83,
      200: 1.53,
      500: 1.34,
      1000: 1.2,
      2500: 1.13,
      5000: 1.06,
      10000: 0.98,
    },
  },
  {
    colorCount: 8,
    pricesByTier: {
      50: 2.59,
      100: 1.98,
      200: 1.66,
      500: 1.45,
      1000: 1.3,
      2500: 1.22,
      5000: 1.14,
      10000: 1.05,
    },
  },
  {
    colorCount: 9,
    pricesByTier: {
      50: 2.75,
      100: 2.13,
      200: 1.79,
      500: 1.56,
      1000: 1.4,
      2500: 1.31,
      5000: 1.22,
      10000: 1.12,
    },
  },
  {
    colorCount: 10,
    pricesByTier: {
      50: 2.91,
      100: 2.28,
      200: 1.92,
      500: 1.67,
      1000: 1.5,
      2500: 1.4,
      5000: 1.3,
      10000: 1.19,
    },
  },
] as const

export type UkTradeScreenPrintPriceLookupResult =
  | {
      quantityTier: UkTradeScreenPrintQuantityTier
      unitPrice: number
    }
  | {
      quantityTier: null
      unitPrice: null
    }

const ukTradeInsideNeckScreenPrintPrices: UkTradeTierPriceMap = {
  50: 0.89,
  100: 0.6,
  200: 0.6,
  500: 0.6,
  1000: 0.6,
  2500: 0.6,
  5000: 0.6,
  10000: 0.6,
}

const ukTradeInsideNeckTransferPrices: UkTradeTierPriceMap = {
  50: 1.34,
  100: 0.9,
  200: 0.9,
  500: 0.9,
  1000: 0.9,
  2500: 0.9,
  5000: 0.9,
  10000: 0.9,
}

function getUkTradeQuantityTier(
  quantity: number,
): UkTradeScreenPrintQuantityTier | null {
  if (quantity < UK_TRADE_SCREEN_PRINT_QUANTITY_TIERS[0]) {
    return null
  }

  return (
    [...UK_TRADE_SCREEN_PRINT_QUANTITY_TIERS]
      .reverse()
      .find((tier) => quantity >= tier) ?? null
  )
}

function getUkTradeTierPrice(
  quantity: number,
  pricesByTier: UkTradeTierPriceMap,
): UkTradeScreenPrintPriceLookupResult {
  const quantityTier = getUkTradeQuantityTier(quantity)

  if (quantityTier === null) {
    return { quantityTier: null, unitPrice: null }
  }

  return {
    quantityTier,
    unitPrice: pricesByTier[quantityTier],
  }
}

export function isUkTradeScreenSetupPosition(
  position: UkTradePrintPositionId,
) {
  return position !== UK_TRADE_NECK_PRINT_TRANSFER_POSITION
}

export function isUkTradeFixedNeckPrintPosition(
  position: UkTradePrintPositionId,
) {
  return (
    position === UK_TRADE_NECK_PRINT_STANDARD_POSITION ||
    position === UK_TRADE_NECK_PRINT_TRANSFER_POSITION
  )
}

export function getUkTradePricingColorCount(
  position: UkTradePrintPositionId,
  colorCount: number,
) {
  return position === UK_TRADE_NECK_PRINT_STANDARD_POSITION ? 1 : colorCount
}

export function getUkTradeSetupScreenCount(
  position: UkTradePrintPositionId,
  colorCount: number,
) {
  if (position === UK_TRADE_NECK_PRINT_STANDARD_POSITION) {
    return 2
  }

  if (position === UK_TRADE_NECK_PRINT_TRANSFER_POSITION) {
    return 0
  }

  return colorCount + 1
}

export function getUkTradeScreenPrintPrice(
  quantity: number,
  colorCount: number,
): UkTradeScreenPrintPriceLookupResult {
  const priceRow = ukTradeScreenPrintPrices.find(
    (row) => row.colorCount === colorCount,
  )

  if (!priceRow) {
    return { quantityTier: null, unitPrice: null }
  }

  return getUkTradeTierPrice(quantity, priceRow.pricesByTier)
}

export function getUkTradePrintPositionPrice(
  quantity: number,
  position: UkTradePrintPositionId,
  colorCount: number,
): UkTradeScreenPrintPriceLookupResult {
  if (position === UK_TRADE_NECK_PRINT_STANDARD_POSITION) {
    return getUkTradeTierPrice(quantity, ukTradeInsideNeckScreenPrintPrices)
  }

  if (position === UK_TRADE_NECK_PRINT_TRANSFER_POSITION) {
    return getUkTradeTierPrice(quantity, ukTradeInsideNeckTransferPrices)
  }

  return getUkTradeScreenPrintPrice(quantity, colorCount)
}
