import type { Prisma } from "@prisma/client"

export const ukTradeGarmentSelect = {
  id: true,
  code: true,
  altCode: true,
  brandName: true,
  name: true,
  color: true,
  gbpPrice: true,
  tags: true,
} satisfies Prisma.GarmentSelect

export type UkTradeGarment = Prisma.GarmentGetPayload<{
  select: typeof ukTradeGarmentSelect
}>

export const UK_TRADE_NECK_PRINT_STANDARD_POSITION = "NECK_PRINT_STANDARD"
export const UK_TRADE_NECK_PRINT_TRANSFER_POSITION = "NECK_PRINT_TRANSFER"

export const UK_TRADE_PRINT_POSITIONS = [
  { value: "FRONT", label: "Front" },
  { value: "BACK", label: "Back" },
  { value: "LEFT_SLEEVE", label: "Left Sleeve" },
  { value: "RIGHT_SLEEVE", label: "Right Sleeve" },
  {
    value: UK_TRADE_NECK_PRINT_STANDARD_POSITION,
    label: "Neck Print Standard",
  },
  {
    value: UK_TRADE_NECK_PRINT_TRANSFER_POSITION,
    label: "Neck Print Transfer",
  },
] as const

export type UkTradePrintPositionId =
  (typeof UK_TRADE_PRINT_POSITIONS)[number]["value"]

export type UkTradePrintPositionState = Partial<
  Record<UkTradePrintPositionId, number>
>
