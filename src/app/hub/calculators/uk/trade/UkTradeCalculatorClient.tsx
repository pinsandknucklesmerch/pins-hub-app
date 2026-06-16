"use client"

import { useMemo, useState } from "react"

import type { Garment } from "@prisma/client"

import {
  getUkTradeScreenPrintPrice,
  UK_TRADE_SCREEN_SETUP_PER_COLOUR,
} from "../tradeScreenPrintData"
import UkTradeDesignCard, { type UkTradeDesign } from "./UkTradeDesignCard"

type UkTradeItemBreakdown = {
  garmentCost: number
  printCost: number
  setupCost: number
  totalCost: number
  costPerUnit: number
  quantity: number
  garmentName?: string
  hasValidPrice: boolean
  missingReasons: string[]
}

function createDefaultDesign(): UkTradeDesign {
  return {
    quantity: 50,
    positions: { FRONT: 1 },
  }
}

function formatCurrency(value: number) {
  return `£${value.toFixed(2)}`
}

function getSelectedPositionEntries(positions: Record<string, number>) {
  return Object.entries(positions).filter(([, colorCount]) => colorCount > 0)
}

function getGarmentDisplayName(garment?: Garment) {
  if (!garment) return "No garment"

  return [garment.brandName, garment.name, garment.color].filter(Boolean).join(" - ")
}

function calculateUkTradeItemBreakdown(
  design: UkTradeDesign,
  garments: Garment[],
): UkTradeItemBreakdown {
  const garment = garments.find((item) => item.id === design.garmentId)
  const selectedPositions = getSelectedPositionEntries(design.positions)
  const missingReasons: string[] = []

  if (!garment) {
    missingReasons.push("Select a garment.")
  } else if (typeof garment.gbpPrice !== "number") {
    missingReasons.push("Selected garment is missing a GBP price.")
  }

  if (design.quantity < 50) {
    missingReasons.push("Minimum quantity is 50.")
  }

  if (selectedPositions.length === 0) {
    missingReasons.push("Select at least one print position.")
  }

  let printCost = 0
  let setupCost = 0

  for (const [, colorCount] of selectedPositions) {
    const price = getUkTradeScreenPrintPrice(design.quantity, colorCount)

    if (typeof price.unitPrice !== "number") {
      missingReasons.push(
        `No UK trade screen print price for quantity ${design.quantity} and ${colorCount} colour${colorCount === 1 ? "" : "s"}.`,
      )
      continue
    }

    printCost += price.unitPrice * design.quantity
    setupCost += colorCount * UK_TRADE_SCREEN_SETUP_PER_COLOUR
  }

  const garmentCost =
    garment && typeof garment.gbpPrice === "number"
      ? garment.gbpPrice * design.quantity
      : 0

  const totalCost = garmentCost + printCost + setupCost
  const hasValidPrice = missingReasons.length === 0

  return {
    garmentCost,
    printCost,
    setupCost,
    totalCost,
    costPerUnit: hasValidPrice && design.quantity > 0 ? totalCost / design.quantity : 0,
    quantity: design.quantity,
    garmentName: getGarmentDisplayName(garment),
    hasValidPrice,
    missingReasons,
  }
}

export default function UkTradeCalculatorClient({
  garments,
}: {
  garments: Garment[]
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
    let setupCost = 0
    let totalCost = 0
    let totalQuantity = 0
    let validItemCount = 0

    for (const breakdown of breakdowns) {
      garmentCost += breakdown.garmentCost
      printCost += breakdown.printCost
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
      setupCost,
      totalCost,
      totalQuantity,
      validItemCount,
      costPerUnit: totalQuantity > 0 ? totalCost / totalQuantity : 0,
    }
  }, [breakdowns])

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
                {formatCurrency(totals.garmentCost)}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-brand-panel p-6 shadow-[0_0_20px_rgba(59,130,246,0.06)]">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted/80">
                Total Cost
              </p>
              <p className="mt-3 text-4xl font-black tabular-nums text-sky-400">
                {formatCurrency(totals.totalCost)}
              </p>
            </div>
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
                    {formatCurrency(totals.printCost)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Setup Cost</span>
                  <span className="font-mono text-brand-cream/90">
                    {formatCurrency(totals.setupCost)}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                  <span>Cost Per Unit</span>
                  <span className="font-mono text-brand-cream/90">
                    {formatCurrency(totals.costPerUnit)}
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
                  {breakdowns.map((breakdown, index) => (
                    <div
                      key={index}
                      className="space-y-3 border-b border-brand-border/80 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-brand-muted/80">
                        <span>
                          {designs[index]?.itemLabel?.trim() || `Item #${index + 1}`} -{" "}
                          {breakdown.garmentName}
                        </span>
                        <span className="shrink-0 whitespace-nowrap font-mono text-brand-muted">
                          {breakdown.quantity} units
                        </span>
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                        <span>Garment Cost</span>
                        <span className="font-mono text-brand-cream/90">
                          {formatCurrency(breakdown.garmentCost)}
                        </span>
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                        <span>Print Cost</span>
                        <span className="font-mono text-brand-cream/90">
                          {formatCurrency(breakdown.printCost)}
                        </span>
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                        <span>Setup Cost</span>
                        <span className="font-mono text-brand-cream/90">
                          {formatCurrency(breakdown.setupCost)}
                        </span>
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-cream/90">
                        <span className="font-semibold">Total Cost</span>
                        <span className="font-mono font-semibold text-sky-300">
                          {formatCurrency(breakdown.totalCost)}
                        </span>
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm text-brand-muted">
                        <span>Cost Per Unit</span>
                        <span className="font-mono text-brand-cream/90">
                          {formatCurrency(breakdown.costPerUnit)}
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}