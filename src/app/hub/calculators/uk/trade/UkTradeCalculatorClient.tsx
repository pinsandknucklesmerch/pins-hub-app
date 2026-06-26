"use client"

import { toast } from "sonner"
import { useMemo, useState } from "react"

import {
  CUSTOMER_QUOTE_COPY_LABEL,
  formatBreakdownAmount,
  formatBreakdownUnitAmount,
  formatSubtotalBreakdownLabel,
  getBreakdownItemLabel,
} from "../../displayStandards"
import {
  getUkTradePrintPositionPrice,
  getUkTradePricingColorCount,
  getUkTradeSetupScreenCount,
  isUkTradeFixedNeckPrintPosition,
  isUkTradeScreenSetupPosition,
  UK_TRADE_SCREEN_SETUP_PER_SCREEN,
} from "../tradeScreenPrintData"
import {
  getUkTradeEmbroideryPrice,
  UK_TRADE_EMBROIDERY_SETUP_PER_ITEM,
} from "../tradeEmbroideryData"
import UkTradeDesignCard, {
  UK_TRADE_EMBROIDERY_ITEMS,
  type UkTradeDesign,
  type UkTradeEmbroideryKey,
} from "./UkTradeDesignCard"
import {
  UK_TRADE_NECK_PRINT_STANDARD_POSITION,
  UK_TRADE_NECK_PRINT_TRANSFER_POSITION,
  UK_TRADE_PRINT_POSITIONS,
  type UkTradeGarment,
  type UkTradePrintPositionId,
  type UkTradePrintPositionState,
} from "./types"

type UkTradeEmbroideryBreakdown = {
  key: UkTradeEmbroideryKey
  label: string
  stitchCount: number
  pricingStitchCount: number | null
  extraStitchBlocks: number
  unitPrice: number
  cost: number
  setupCost: number
}

type UkTradeItemBreakdown = {
  garmentCost: number
  printCost: number
  screenSetupScreenCount: number
  screenSetupCost: number
  embroideryCost: number
  embroiderySetupCost: number
  setupCost: number
  totalCost: number
  costPerUnit: number
  quantity: number
  garmentName?: string
  hasValidPrice: boolean
  missingReasons: string[]
  embroideryBreakdowns: UkTradeEmbroideryBreakdown[]
}

const CURRENCY = "£"

function createDefaultDesign(): UkTradeDesign {
  return {
    quantity: 50,
    positions: { FRONT: 1 },
  }
}

function getSelectedPositionEntries(
  positions: UkTradePrintPositionState,
): Array<[UkTradePrintPositionId, number]> {
  return UK_TRADE_PRINT_POSITIONS.flatMap((position) => {
    const colorCount = positions[position.value] ?? 0

    if (colorCount <= 0) {
      return []
    }

    return [[position.value, colorCount]]
  })
}

function getSelectedEmbroideryEntries(design: UkTradeDesign) {
  return UK_TRADE_EMBROIDERY_ITEMS.flatMap((item) => {
    const stitchCount = design.embroideryItems?.[item.key]

    if (typeof stitchCount !== "number") {
      return []
    }

    return [{ ...item, stitchCount }]
  })
}

function getGarmentDisplayName(garment?: UkTradeGarment) {
  if (!garment) return "No garment"

  return [garment.brandName, garment.name, garment.color].filter(Boolean).join(" - ")
}

function getGarmentQuoteSummary(garment?: UkTradeGarment) {
  if (!garment) return "No garment"

  return [garment.code, garment.brandName, garment.name, garment.color]
    .filter(Boolean)
    .join(" ")
}

function getPrintPositionLabel(position: string) {
  return (
    UK_TRADE_PRINT_POSITIONS.find((item) => item.value === position)?.label ??
    position
  )
}

function formatUkTradePrintQuoteLabel(
  position: UkTradePrintPositionId,
  colorCount: number,
) {
  if (
    position === UK_TRADE_NECK_PRINT_STANDARD_POSITION ||
    position === UK_TRADE_NECK_PRINT_TRANSFER_POSITION
  ) {
    return getPrintPositionLabel(position)
  }

  return `${colorCount} Col ${getPrintPositionLabel(position)}`
}

function formatUkTradePrintBreakdownLabel(
  position: UkTradePrintPositionId,
  colorCount: number,
) {
  if (
    position === UK_TRADE_NECK_PRINT_STANDARD_POSITION ||
    position === UK_TRADE_NECK_PRINT_TRANSFER_POSITION
  ) {
    return getPrintPositionLabel(position)
  }

  return `${getPrintPositionLabel(position)} Print (${colorCount} col)`
}

function formatEmbroideryQuoteLabel(embroidery: UkTradeEmbroideryBreakdown) {
  const extraText =
    embroidery.extraStitchBlocks > 0
      ? ` + ${embroidery.extraStitchBlocks} extra 1k`
      : ""

  return `${embroidery.label} ${embroidery.stitchCount.toLocaleString()} stitches${extraText}`
}

function formatUkTradeQuoteCopy({
  designs,
  breakdowns,
  garments,
  currency,
}: {
  designs: UkTradeDesign[]
  breakdowns: UkTradeItemBreakdown[]
  garments: UkTradeGarment[]
  currency: string
}) {
  return breakdowns
    .map((breakdown, index) => {
      const design = designs[index]
      if (!design || !breakdown.hasValidPrice) return null

      const garment = garments.find((item) => item.id === design.garmentId)
      const printSummary = getSelectedPositionEntries(design.positions).map(
        ([position, colorCount]) =>
          formatUkTradePrintQuoteLabel(position, colorCount),
      )
      const embroiderySummary = breakdown.embroideryBreakdowns.map(
        formatEmbroideryQuoteLabel,
      )
      const workSummary = [...printSummary, ...embroiderySummary]
        .filter(Boolean)
        .join(", ")
      const unitExclVat =
        design.quantity > 0 ? breakdown.totalCost / design.quantity : 0

      return [
        `${getBreakdownItemLabel(design.itemLabel, index)}:`,
        "",
        `${getGarmentQuoteSummary(garment)}${
          workSummary ? ` (${workSummary})` : ""
        }`,
        `${design.quantity} x ${currency}${unitExclVat.toFixed(2)} each (${currency}${breakdown.totalCost.toFixed(2)} ex vat)`,
      ].join("\n")
    })
    .filter((entry): entry is string => Boolean(entry))
    .join("\n\n")
}

function calculateUkTradeItemBreakdown(
  design: UkTradeDesign,
  garments: UkTradeGarment[],
): UkTradeItemBreakdown {
  const garment = garments.find((item) => item.id === design.garmentId)
  const selectedPositions = getSelectedPositionEntries(design.positions)
  const selectedEmbroideryEntries = getSelectedEmbroideryEntries(design)
  const missingReasons: string[] = []

  if (!garment) {
    missingReasons.push("Select garment.")
  }

  if (design.quantity < 50) {
    missingReasons.push("Minimum quantity 50.")
  }

  if (selectedPositions.length === 0 && selectedEmbroideryEntries.length === 0) {
    missingReasons.push("Select at least one print position or embroidery item.")
  }

  let printCost = 0
  let screenSetupScreenCount = 0
  let screenSetupCost = 0

  for (const [position, colorCount] of selectedPositions) {
    const pricingColorCount = getUkTradePricingColorCount(position, colorCount)
    const price = getUkTradePrintPositionPrice(
      design.quantity,
      position,
      pricingColorCount,
    )

    if (price.unitPrice === null) {
      missingReasons.push(`Missing price for ${getPrintPositionLabel(position)}.`)
    }

    printCost += (price.unitPrice ?? 0) * design.quantity

    if (isUkTradeScreenSetupPosition(position)) {
      screenSetupScreenCount += getUkTradeSetupScreenCount(
        position,
        pricingColorCount,
      )
    }
  }

  screenSetupCost = screenSetupScreenCount * UK_TRADE_SCREEN_SETUP_PER_SCREEN

  const embroideryBreakdowns = selectedEmbroideryEntries.map((embroidery) => {
    const price = getUkTradeEmbroideryPrice(
      design.quantity,
      embroidery.stitchCount,
    )
    const unitPrice = price.unitPrice ?? 0
    const cost = unitPrice * design.quantity

    return {
      key: embroidery.key,
      label: embroidery.label,
      stitchCount: embroidery.stitchCount,
      pricingStitchCount: price.pricingStitchCount,
      extraStitchBlocks: price.extraStitchBlocks,
      unitPrice,
      cost,
      setupCost: UK_TRADE_EMBROIDERY_SETUP_PER_ITEM,
    }
  })

  const embroideryCost = embroideryBreakdowns.reduce(
    (sum, embroidery) => sum + embroidery.cost,
    0,
  )
  const embroiderySetupCost = embroideryBreakdowns.reduce(
    (sum, embroidery) => sum + embroidery.setupCost,
    0,
  )
  const garmentCost =
    garment && typeof garment.gbpPrice === "number"
      ? garment.gbpPrice * design.quantity
      : 0
  const setupCost = screenSetupCost + embroiderySetupCost
  const totalCost = garmentCost + printCost + embroideryCost + setupCost
  const hasValidPrice = missingReasons.length === 0

  return {
    garmentCost,
    printCost,
    screenSetupScreenCount,
    screenSetupCost,
    embroideryCost,
    embroiderySetupCost,
    setupCost,
    totalCost,
    costPerUnit: hasValidPrice && design.quantity > 0 ? totalCost / design.quantity : 0,
    quantity: design.quantity,
    garmentName: getGarmentDisplayName(garment),
    hasValidPrice,
    missingReasons,
    embroideryBreakdowns,
  }
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.style.position = "fixed"
  textArea.style.left = "-9999px"
  textArea.style.top = "-9999px"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  document.execCommand("copy")
  document.body.removeChild(textArea)
}

export default function UkTradeCalculatorClient({
  garments,
}: {
  garments: UkTradeGarment[]
}) {
  const [designs, setDesigns] = useState<UkTradeDesign[]>([createDefaultDesign()])

  function addDesign() {
    setDesigns((current) => [...current, createDefaultDesign()])
  }

  function updateDesign(index: number, updated: UkTradeDesign) {
    setDesigns((current) => {
      const next = [...current]
      next[index] = updated
      return next
    })
  }

  function removeDesign(index: number) {
    setDesigns((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  const breakdowns = useMemo(
    () => designs.map((design) => calculateUkTradeItemBreakdown(design, garments)),
    [designs, garments],
  )

  const hasAnyGarmentSelected = designs.some((design) => Boolean(design.garmentId))

  const totals = useMemo(() => {
    let garmentCost = 0
    let printCost = 0
    let screenSetupScreenCount = 0
    let screenSetupCost = 0
    let embroideryCost = 0
    let embroiderySetupCost = 0
    let setupCost = 0
    let totalCost = 0
    let totalQuantity = 0
    let validItemCount = 0

    for (const breakdown of breakdowns) {
      garmentCost += breakdown.garmentCost
      printCost += breakdown.printCost
      screenSetupScreenCount += breakdown.screenSetupScreenCount
      screenSetupCost += breakdown.screenSetupCost
      embroideryCost += breakdown.embroideryCost
      embroiderySetupCost += breakdown.embroiderySetupCost
      setupCost += breakdown.setupCost
      totalCost += breakdown.totalCost

      if (breakdown.hasValidPrice) {
        totalQuantity += breakdown.quantity
        validItemCount += 1
      }
    }

    return {
      garmentCost,
      printCost,
      screenSetupScreenCount,
      screenSetupCost,
      embroideryCost,
      embroiderySetupCost,
      setupCost,
      totalCost,
      totalQuantity,
      validItemCount,
      costPerUnit: totalQuantity > 0 ? totalCost / totalQuantity : 0,
    }
  }, [breakdowns])

  async function handleCopyClick() {
    if (!hasAnyGarmentSelected) return

    const body = formatUkTradeQuoteCopy({
      designs,
      breakdowns,
      garments,
      currency: CURRENCY,
    })

    if (!body.trim()) return

    await copyToClipboard(body)
    toast.success("Quote copied to clipboard")
  }

  return (
    <div className="grid w-full min-w-0 gap-5 overflow-x-hidden xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
      <div className="max-w-[900px] space-y-4">
        {designs.map((design, index) => (
          <UkTradeDesignCard
            key={index}
            design={design}
            garments={garments}
            itemNumber={index + 1}
            onChange={(updated) => updateDesign(index, updated)}
            onRemove={designs.length > 1 ? () => removeDesign(index) : undefined}
          />
        ))}

        <div className="mt-2">
          <button
            onClick={addDesign}
            className="hub-accent-button flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
        <div
          className={`rounded-2xl border border-brand-border/80 bg-brand-panel-alt/30 p-4 transition-opacity ${
            hasAnyGarmentSelected ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-brand-border bg-brand-panel p-6 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted/80">
                Garment Cost
              </p>
              <p className="mt-3 text-4xl font-black tabular-nums text-brand-cream/90">
                {formatBreakdownAmount(CURRENCY, totals.garmentCost)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyClick}
              className="hub-info-card flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-brand-panel text-left transition-all duration-300"
              aria-label="Copy UK trade quote"
            >
              <div className="flex-grow p-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted/80">
                    Total Cost
                  </p>
                  <span className="hub-info-pill rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                    {CUSTOMER_QUOTE_COPY_LABEL}
                  </span>
                </div>
                <div className="mb-6">
                  <span className="hub-info-text text-4xl font-black tabular-nums md:text-5xl">
                    {formatBreakdownAmount(CURRENCY, totals.totalCost)}
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-brand-border bg-brand-panel shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between border-b border-brand-border bg-brand-panel-alt px-6 py-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                Breakdown
              </h2>
              <span className="text-brand-muted">⌄</span>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="space-y-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Print Cost</span>
                  <span className="font-mono text-brand-cream/90">
                    {formatBreakdownAmount(CURRENCY, totals.printCost)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Setup screens</span>
                  <span className="font-mono text-brand-cream/90">
                    {totals.screenSetupScreenCount}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Screen setup</span>
                  <span className="font-mono text-brand-cream/90">
                    {totals.screenSetupScreenCount} ×{" "}
                    {formatBreakdownAmount(
                      CURRENCY,
                      UK_TRADE_SCREEN_SETUP_PER_SCREEN,
                    )}{" "}
                    = {formatBreakdownAmount(CURRENCY, totals.screenSetupCost)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Embroidery Cost</span>
                  <span className="font-mono text-brand-cream/90">
                    {formatBreakdownAmount(CURRENCY, totals.embroideryCost)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Embroidery setup</span>
                  <span className="font-mono text-brand-cream/90">
                    {formatBreakdownAmount(CURRENCY, totals.embroiderySetupCost)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Total Unit Cost (excl VAT)</span>
                  <span className="font-mono text-brand-cream/90">
                    {formatBreakdownUnitAmount(CURRENCY, totals.costPerUnit)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-cream/90">
                  <span className="font-semibold">
                    {formatSubtotalBreakdownLabel(totals.totalQuantity)}
                  </span>
                  <span className="font-mono font-semibold text-sky-300">
                    {formatBreakdownAmount(CURRENCY, totals.totalCost)}
                  </span>
                </div>

                <p className="text-xs text-brand-muted">
                  Based on {totals.totalQuantity} valid unit
                  {totals.totalQuantity === 1 ? "" : "s"} across{" "}
                  {totals.validItemCount} valid item
                  {totals.validItemCount === 1 ? "" : "s"}.
                </p>
              </div>

              <div className="border-t border-brand-border pt-5">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-muted">
                  Item Breakdown
                </h3>

                <div className="space-y-4">
                  {breakdowns.map((breakdown, index) => {
                    const design = designs[index]
                    const garment = garments.find(
                      (item) => item.id === design?.garmentId,
                    )

                    if (!design) return null

                    return (
                      <div
                        key={index}
                        className="space-y-3 border-b border-brand-border/80 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-brand-muted/80">
                          <span>
                            {getBreakdownItemLabel(design.itemLabel, index)} -{" "}
                            {breakdown.garmentName}
                          </span>
                          <span className="shrink-0 whitespace-nowrap font-mono text-brand-muted">
                            {breakdown.quantity} units
                          </span>
                        </div>

                        {garment ? (
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                            <span>Garment Base Price</span>
                            <span className="font-mono text-brand-cream/90">
                              {formatBreakdownUnitAmount(
                                CURRENCY,
                                typeof garment.gbpPrice === "number"
                                  ? garment.gbpPrice
                                  : 0,
                              )}
                            </span>
                          </div>
                        ) : null}

                        {getSelectedPositionEntries(design.positions).map(
                          ([position, colorCount]) => {
                            const pricingColorCount =
                              getUkTradePricingColorCount(position, colorCount)
                            const unitPrice = getUkTradePrintPositionPrice(
                              design.quantity,
                              position,
                              pricingColorCount,
                            )
                            const unitPriceValue = unitPrice.unitPrice
                            const hasUnitPrice = unitPriceValue !== null
                            const isFixedNeck =
                              isUkTradeFixedNeckPrintPosition(position)

                            if (isFixedNeck) {
                              const fixedDescription =
                                position === UK_TRADE_NECK_PRINT_STANDARD_POSITION
                                  ? "fixed 1 colour"
                                  : "fixed transfer"

                              return (
                                <div
                                  key={position}
                                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted"
                                >
                                  <span className="font-semibold text-brand-red/90">
                                    {getPrintPositionLabel(position)} ·{" "}
                                    {fixedDescription}
                                  </span>
                                  <span
                                    className={`font-mono font-semibold ${
                                      unitPriceValue === null
                                        ? "text-brand-red/90"
                                        : "text-brand-cream/90"
                                    }`}
                                  >
                                    {unitPriceValue === null
                                      ? "Missing price"
                                      : `${formatBreakdownAmount(
                                          CURRENCY,
                                          unitPriceValue,
                                        )}/unit`}
                                  </span>
                                </div>
                              )
                            }

                            return (
                              <div
                                key={position}
                                className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted"
                              >
                                <span>
                                  {formatUkTradePrintBreakdownLabel(
                                    position,
                                    colorCount,
                                  )}
                                </span>
                                <span
                                  className={`font-mono ${
                                    hasUnitPrice
                                      ? "text-brand-cream/90"
                                      : "text-brand-red/90"
                                  }`}
                                >
                                  {unitPriceValue !== null
                                    ? formatBreakdownUnitAmount(
                                        CURRENCY,
                                        unitPriceValue,
                                      )
                                    : "Missing price"}
                                </span>
                              </div>
                            )
                          },
                        )}

                        {breakdown.embroideryBreakdowns.map((embroidery) => (
                          <div key={embroidery.key} className="space-y-2">
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                              <span>
                                {embroidery.label} -{" "}
                                {embroidery.stitchCount.toLocaleString()} stitches
                              </span>
                              <span className="font-mono text-brand-cream/90">
                                {formatBreakdownUnitAmount(
                                  CURRENCY,
                                  embroidery.unitPrice,
                                )}
                              </span>
                            </div>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-xs text-brand-muted/85">
                              <span>Embroidery setup</span>
                              <span className="font-mono text-brand-cream/90">
                                {formatBreakdownAmount(
                                  CURRENCY,
                                  embroidery.setupCost,
                                )}
                              </span>
                            </div>
                          </div>
                        ))}

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                          <span>Setup screens</span>
                          <span className="font-mono text-brand-cream/90">
                            {breakdown.screenSetupScreenCount}
                          </span>
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                          <span>Screen setup</span>
                          <span className="font-mono text-brand-cream/90">
                            {breakdown.screenSetupScreenCount} ×{" "}
                            {formatBreakdownAmount(
                              CURRENCY,
                              UK_TRADE_SCREEN_SETUP_PER_SCREEN,
                            )}{" "}
                            ={" "}
                            {formatBreakdownAmount(
                              CURRENCY,
                              breakdown.screenSetupCost,
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                          <span>Embroidery setup</span>
                          <span className="font-mono text-brand-cream/90">
                            {formatBreakdownAmount(
                              CURRENCY,
                              breakdown.embroiderySetupCost,
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                          <span>Total Unit Cost (excl VAT)</span>
                          <span className="font-mono text-brand-cream/90">
                            {formatBreakdownUnitAmount(
                              CURRENCY,
                              breakdown.costPerUnit,
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-cream/90">
                          <span className="font-semibold">Item Total</span>
                          <span className="font-mono font-semibold text-sky-300">
                            {formatBreakdownAmount(CURRENCY, breakdown.totalCost)}
                          </span>
                        </div>

                        {!breakdown.hasValidPrice ? (
                          <div className="rounded-xl border border-brand-red/35 bg-brand-red/10 p-3">
                            <ul className="space-y-1 text-sm text-brand-cream/90">
                              {breakdown.missingReasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
