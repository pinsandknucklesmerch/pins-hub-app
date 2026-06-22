import type { Garment, GarmentMarkup, PrintPrice } from "@prisma/client"
import { useState } from "react"

export const PRINT_POSITIONS = [
  { value: "FRONT", label: "Front" },
  { value: "BACK", label: "Back" },
  { value: "LEFT_SLEEVE", label: "Left Sleeve" },
  { value: "RIGHT_SLEEVE", label: "Right Sleeve" },
  { value: "NECK", label: "Neck" }
] as const

export const NECK_PRINT_UNIT_PRICE = 0.7

export type DesignEmbroiderySize = "small" | "medium" | "large"

export type DesignEmbroideryKey = "embroidery1" | "embroidery2" | "embroidery3"

export type DesignEmbroideryState = Partial<Record<DesignEmbroideryKey, DesignEmbroiderySize>>

export const DESIGN_EMBROIDERY_ITEMS: { key: DesignEmbroideryKey; label: string }[] = [
  { key: "embroidery1", label: "Embroidery 1" },
  { key: "embroidery2", label: "Embroidery 2" },
  { key: "embroidery3", label: "Embroidery 3" }
]

export const DESIGN_EMBROIDERY_SIZE_PRICING: Record<
  DesignEmbroiderySize,
  { label: string; productionUnitCost: number; customerUnitCost: number }
> = {
  small: { label: "Small", productionUnitCost: 1.25, customerUnitCost: 1.5 },
  medium: { label: "Medium", productionUnitCost: 1.85, customerUnitCost: 2 },
  large: { label: "Large", productionUnitCost: 2.5, customerUnitCost: 2.75 }
}

export const DESIGN_EMBROIDERY_SIZE_OPTIONS: { value: DesignEmbroiderySize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" }
]

const DEFAULT_DESIGN_EMBROIDERY_SIZE: DesignEmbroiderySize = "small"

export const EMBROIDERY_CUSTOMER_DIGITIZING_FEE = 25
export const EMBROIDERY_PRODUCTION_DIGITIZING_COST = 23

export type Design = {
  garmentId?: string
  quantity: number
  positions: Record<string, number>
  embroideryItems?: DesignEmbroideryState
  itemLabel?: string
  pkMarkupEnabled?: boolean
  pkMarkupInput?: string
  pkMarkupPerUnit?: number
}

export type DesignCostBreakdown = {
  productionCost: number
  pinsCost: number
  baseCost: number
  markupCost: number
  pkMarkupCost: number
  embroideryCost: number
  digitizingFee: number
  embroideryProductionCost: number
  digitizingProductionCost: number
  embroideryPositionCount: number
  garmentName?: string
  quantity: number
}

const MIN_COLOR_COUNT = 1
const MAX_COLOR_COUNT = 9
const COLOR_COUNT_WARNING = "Acceptable color counts are between 1 and 9."

function getDefaultItemLabel(itemNumber?: number) {
  return itemNumber ? `Item #${itemNumber}` : "Item"
}

function getColorInputState(positions: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(positions)
      .filter(([, colorCount]) => colorCount > 0)
      .map(([position, colorCount]) => [position, String(colorCount)])
  )
}

export function formatDesignEmbroiderySizeLabel(size: DesignEmbroiderySize) {
  return DESIGN_EMBROIDERY_SIZE_PRICING[size].label
}

export function getSelectedDesignEmbroideryEntries(design: Pick<Design, "embroideryItems">) {
  return DESIGN_EMBROIDERY_ITEMS.flatMap((item) => {
    const size = design.embroideryItems?.[item.key]

    if (!size) {
      return []
    }

    return [{ ...item, size, sizeLabel: formatDesignEmbroiderySizeLabel(size) }]
  })
}

export function isPrintPositionSelected(
  design: Pick<Design, "positions">,
  position: string
) {
  return (design.positions[position] || 0) > 0
}

export function getPrintUnitPrices(
  position: string,
  design: Design,
  printPrices: PrintPrice[]
) {
  if (position === "NECK") {
    return {
      productionPrice: NECK_PRINT_UNIT_PRICE,
      pinsPrice: NECK_PRINT_UNIT_PRICE,
      isFixedPrice: true
    }
  }

  const colorCount = design.positions[position] || 0

  const tier = printPrices.find(
    (p) =>
      p.colorCount === colorCount &&
      design.quantity >= p.qtyMin &&
      design.quantity <= p.qtyMax
  )

  return {
    productionPrice: tier?.productionPrice ?? 0,
    pinsPrice: tier?.pinsPrice ?? 0,
    isFixedPrice: false
  }
}

export function calculateDesignCosts(
  design: Design,
  garments: Garment[],
  printPrices: PrintPrice[],
  garmentMarkups: GarmentMarkup[]
): DesignCostBreakdown {
  let prod = 0
  let pins = 0

  for (const position of Object.keys(design.positions)) {
    if (design.positions[position] > 0) {
      const unitPrices = getPrintUnitPrices(position, design, printPrices)

      prod += unitPrices.productionPrice * design.quantity
      pins += unitPrices.pinsPrice * design.quantity
    }
  }

  const garment = garments.find((g) => g.id === design.garmentId)
  const baseCost = garment ? garment.basePrice * design.quantity : 0

  const markup = garment
    ? garmentMarkups.find((m) => m.garmentType === garment.type)
    : undefined
  const markupCost = markup ? markup.markupValue * design.quantity : 0
  const pkMarkupCost = design.pkMarkupEnabled ? (design.pkMarkupPerUnit ?? 0) * design.quantity : 0
  const embroideryEntries = getSelectedDesignEmbroideryEntries(design)
  const embroideryCost = embroideryEntries.reduce((sum, embroidery) => {
    return sum + DESIGN_EMBROIDERY_SIZE_PRICING[embroidery.size].customerUnitCost * design.quantity
  }, 0)
  const embroideryProductionCost = embroideryEntries.reduce((sum, embroidery) => {
    return sum + DESIGN_EMBROIDERY_SIZE_PRICING[embroidery.size].productionUnitCost * design.quantity
  }, 0)
  const embroideryPositionCount = embroideryEntries.length
  const digitizingFee = embroideryPositionCount * EMBROIDERY_CUSTOMER_DIGITIZING_FEE
  const digitizingProductionCost = embroideryPositionCount * EMBROIDERY_PRODUCTION_DIGITIZING_COST

  return {
    productionCost: prod,
    pinsCost: pins,
    baseCost,
    markupCost,
    pkMarkupCost,
    embroideryCost,
    digitizingFee,
    embroideryProductionCost,
    digitizingProductionCost,
    embroideryPositionCount,
    garmentName: garment?.name,
    quantity: design.quantity
  }
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function getGarmentLabel(garment: Garment) {
  return [garment.name, garment.color].filter(Boolean).join(" - ")
}

function GarmentSelector({
  garments,
  value,
  onChange
}: {
  garments: Garment[]
  value?: string
  onChange: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const selected = garments.find((g) => g.id === value)
  const displayValue = isOpen ? query : selected ? `${getGarmentLabel(selected)} (${selected.code})` : ""

  const filtered = garments.filter((g) => {
    const queryParts = normalizeSearch(query).split(" ").filter(Boolean)

    if (queryParts.length === 0) {
      return true
    }

    const searchableText = normalizeSearch([
      g.name,
      g.code,
      g.altCode,
      g.brandName,
      g.color,
      g.tags
    ].filter(Boolean).join(" "))

    return queryParts.every((part) => searchableText.includes(part))
  })

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value)
          if (!isOpen) setIsOpen(true)
        }}
        onFocus={() => {
          setIsOpen(true)
          setQuery("")
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder="Search for a garment..."
        className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow placeholder:text-brand-muted/80"
      />
      {isOpen && (
        <ul className="absolute z-10 w-full mt-2 max-h-60 overflow-auto bg-brand-panel border border-brand-border rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {filtered.length === 0 ? (
            <li className="p-3 text-sm text-brand-muted/80">No garments found.</li>
          ) : (
            filtered.map((g) => (
              <li
                key={g.id}
                onMouseDown={() => {
                  onChange(g.id)
                  setIsOpen(false)
                  setQuery("")
                }}
                className="p-3 text-sm hover:bg-brand-surface cursor-pointer text-brand-cream/90 flex justify-between items-center whitespace-nowrap transition-colors"
              >
                <span>{getGarmentLabel(g)}</span>
                <span className="text-brand-muted/80 text-xs ml-2 font-mono">
                  {[g.code, g.altCode].filter(Boolean).join(" / ")}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default function DesignCard({
  design,
  garments,
  itemNumber,
  onChange,
  onRemove
}: {
  design: Design
  garments: Garment[]
  itemNumber?: number
  onChange: (d: Design) => void
  onRemove?: () => void
}) {
  const [colorInputs, setColorInputs] = useState<Record<string, string>>(() =>
    getColorInputState(design.positions)
  )
  const [colorError, setColorError] = useState<string>("")

  function updateQuantity(value: number) {
    onChange({ ...design, quantity: value })
  }

  function updateGarment(garmentId: string) {
    onChange({ ...design, garmentId })
  }

  function updatePositionColor(position: string, colors: number) {
    onChange({
      ...design,
      positions: {
        ...design.positions,
        [position]: colors
      }
    })
  }

  function togglePosition(position: string, isSelected: boolean) {
    if (isSelected) {
      setColorInputs((current) => {
        const next = { ...current }
        delete next[position]
        return next
      })
      updatePositionColor(position, 0)
      return
    }

    setColorInputs((current) => ({ ...current, [position]: String(MIN_COLOR_COUNT) }))
    updatePositionColor(position, MIN_COLOR_COUNT)
  }

  function updatePositionColorInput(position: string, value: string) {
    if (!/^\d*$/.test(value)) return

    setColorInputs((current) => ({ ...current, [position]: value }))

    if (value === "") return

    const parsedValue = Number(value)
    if (
      Number.isInteger(parsedValue) &&
      parsedValue >= MIN_COLOR_COUNT &&
      parsedValue <= MAX_COLOR_COUNT
    ) {
      updatePositionColor(position, parsedValue)
    }
  }

  function normalizePositionColorInput(position: string) {
    const value = colorInputs[position] ?? ""
    const parsedValue = Number(value)
    const isValid =
      value !== "" &&
      Number.isInteger(parsedValue) &&
      parsedValue >= MIN_COLOR_COUNT &&
      parsedValue <= MAX_COLOR_COUNT

    if (!isValid) {
      setColorError(COLOR_COUNT_WARNING)
      setColorInputs((current) => ({
        ...current,
        [position]: String(MIN_COLOR_COUNT)
      }))
      updatePositionColor(position, MIN_COLOR_COUNT)
      return
    }

    setColorError("")
    const normalizedValue = String(parsedValue)
    if (value !== normalizedValue) {
      setColorInputs((current) => ({
        ...current,
        [position]: normalizedValue
      }))
    }

    updatePositionColor(position, parsedValue)
  }

  function updatePkMarkupEnabled(enabled: boolean) {
    onChange({
      ...design,
      pkMarkupEnabled: enabled
    })
  }

  function updatePkMarkupPerUnit(value: string) {
    if (!/^-?\d*\.?\d*$/.test(value)) return

    const parsedValue = Number(value)

    onChange({
      ...design,
      pkMarkupInput: value,
      pkMarkupPerUnit: Number.isFinite(parsedValue) ? parsedValue : 0
    })
  }

  function toggleDesignEmbroideryItem(item: DesignEmbroideryKey, isSelected: boolean) {
    const nextEmbroideryItems = { ...(design.embroideryItems ?? {}) }

    if (isSelected) {
      delete nextEmbroideryItems[item]
    } else {
      nextEmbroideryItems[item] = DEFAULT_DESIGN_EMBROIDERY_SIZE
    }

    onChange({
      ...design,
      embroideryItems: nextEmbroideryItems
    })
  }

  function updateDesignEmbroiderySize(item: DesignEmbroideryKey, size: DesignEmbroiderySize) {
    onChange({
      ...design,
      embroideryItems: {
        ...(design.embroideryItems ?? {}),
        [item]: size
      }
    })
  }

  const defaultItemLabel = getDefaultItemLabel(itemNumber)
  const itemLabelValue = design.itemLabel ?? defaultItemLabel
  const activePositionRows = PRINT_POSITIONS.filter((pos) =>
    isPrintPositionSelected(design, pos.value)
  )
  const selectedEmbroideryItems = DESIGN_EMBROIDERY_ITEMS.filter(
    (item) => design.embroideryItems?.[item.key]
  )

  function updateItemLabel(value: string) {
    onChange({
      ...design,
      itemLabel: value
    })
  }

  function normalizeItemLabel() {
    const trimmedValue = (design.itemLabel ?? "").trim()

    onChange({
      ...design,
      itemLabel: trimmedValue || undefined
    })
  }



  return (
    <div className="relative w-full min-w-0 max-w-full min-h-[380px] overflow-hidden bg-brand-panel border border-brand-border/80 p-6 mb-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-4 right-4 text-brand-muted/80 hover:text-brand-red transition-colors"
          title="Remove design"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      )}
      <div className="mb-2">
        <input
          type="text"
          value={itemLabelValue}
          onChange={(e) => updateItemLabel(e.target.value)}
          onBlur={normalizeItemLabel}
          aria-label={`Item ${itemNumber ?? 1} label`}
          className="w-64 rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-lg font-bold text-brand-cream outline-none transition-shadow placeholder:text-brand-muted-soft focus:border-brand-red/60 focus:ring-2 focus:ring-brand-red/40"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-2">Garment</label>
          <GarmentSelector 
            garments={garments} 
            value={design.garmentId} 
            onChange={updateGarment} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-muted mb-2">Quantity</label>
          <input
            type="number"
            min={50}
            value={design.quantity || ""}
            onChange={(e) => updateQuantity(Number(e.target.value))}
            className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-medium text-brand-muted">Print / Embroidery Positions</h4>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
            {PRINT_POSITIONS.map((pos) => {
              const isSelected = (design.positions[pos.value] || 0) > 0
              return (
                <button
                key={pos.value}
                type="button"
                onClick={() => togglePosition(pos.value, isSelected)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-brand-red/16 text-brand-red/90 border-brand-red/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    : "bg-brand-panel-alt text-brand-muted border-brand-border hover:border-brand-border/80 hover:bg-brand-surface"
                }`}
              >
                {pos.label}
                </button>
              )
            })}

            {DESIGN_EMBROIDERY_ITEMS.map((item) => {
              const isSelected = Boolean(design.embroideryItems?.[item.key])

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleDesignEmbroideryItem(item.key, isSelected)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brand-red/16 text-brand-red/90 border-brand-red/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                      : "bg-brand-panel-alt text-brand-muted border-brand-border hover:border-brand-border/80 hover:bg-brand-surface"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
{/* 
        {Object.keys(design.positions).some(p => design.positions[p] > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border border-brand-border/60 bg-brand-panel-alt/50 rounded-xl">
            {PRINT_POSITIONS.filter(pos => (design.positions[pos.value] || 0) > 0).map((pos) => (
              <div key={pos.value} className="flex flex-col">
                <label className="text-xs font-bold text-brand-red/90 mb-2 uppercase tracking-wider">{pos.label} Colors</label>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={colorInputs[pos.value] ?? ""}
                  onChange={(e) => updatePositionColorInput(pos.value, e.target.value)}
                  onBlur={() => normalizePositionColorInput(pos.value)}
                  className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
                />
                {colorError && (
                  <p className="text-xs text-brand-red/90 mt-1">{colorError}</p>
                )}
              </div>
            ))}
          </div>
        )} */}
        <div className="min-h-[120px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 border border-brand-border/60 bg-brand-panel-alt/50 rounded-xl">
          {activePositionRows.map((pos) => {
            const hasPrint = (design.positions[pos.value] || 0) > 0

            return (
              <div key={pos.value} className="flex min-h-[104px] flex-col rounded-lg border border-brand-border/60 bg-brand-panel/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <label className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-red/90">
                    {pos.label}
                  </label>
                </div>

                {hasPrint ? (
                  <>
                    <span className="mb-1 text-[11px] font-semibold text-brand-muted/80">Print Colours</span>
                    <input
                      type="number"
                      min={1}
                      max={9}
                      value={colorInputs[pos.value] ?? ""}
                      onChange={(e) => updatePositionColorInput(pos.value, e.target.value)}
                      onBlur={() => normalizePositionColorInput(pos.value)}
                      className="w-full border border-brand-border rounded-lg p-2.5 bg-brand-panel text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
                    />

                    <div className="min-h-[18px]">
                      {colorError && (
                        <p className="text-xs text-brand-red/90 mt-1">{colorError}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="min-h-[58px] rounded-lg border border-brand-border/60 bg-brand-panel-alt/50 px-3 py-2 text-xs text-brand-muted/80">
                    No print selected
                  </div>
                )}

              </div>
            )
          })}
          {selectedEmbroideryItems.map((item) => {
            const selectedSize = design.embroideryItems?.[item.key]

            if (!selectedSize) {
              return null
            }

            return (
              <div key={item.key} className="flex min-h-[104px] flex-col rounded-lg border border-brand-red/40 bg-brand-red/10 p-3 shadow-[0_0_15px_rgba(239,68,68,0.08)]">
                <label className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-red/90">
                  {item.label}
                </label>

                <span className="mb-1 text-[11px] font-semibold text-brand-muted/80">Embroidery Size</span>
                <select
                  value={selectedSize}
                  onChange={(e) =>
                    updateDesignEmbroiderySize(item.key, e.target.value as DesignEmbroiderySize)
                  }
                  className="w-full rounded-lg border border-brand-border bg-brand-panel-alt p-2.5 text-sm text-brand-cream outline-none transition-shadow focus:border-brand-red/60 focus:ring-2 focus:ring-brand-red/40"
                >
                  {DESIGN_EMBROIDERY_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>

          {selectedEmbroideryItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedEmbroideryItems.map((item) => {
                const selectedSize = design.embroideryItems?.[item.key]

                if (!selectedSize) {
                  return null
                }

                return (
                  <span
                    key={item.key}
                    className="rounded-full border border-brand-border/70 bg-brand-panel-alt px-3 py-1 text-xs font-medium text-brand-muted"
                  >
                    {item.label}: {formatDesignEmbroiderySizeLabel(selectedSize)}
                  </span>
                )
              })}
            </div>
          )}

        <div className="mt-4 space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-brand-muted">
          <input
            type="checkbox"
            checked={design.pkMarkupEnabled ?? false}
            onChange={(e) => updatePkMarkupEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-brand-border/80 bg-brand-panel-alt text-brand-red focus:ring-brand-red/40"
          />
          PK Markup
        </label>
        {design.pkMarkupEnabled && (
          <input
            type="text"
            inputMode="decimal"
            value={design.pkMarkupInput ?? String(design.pkMarkupPerUnit ?? 0)}
            onChange={(e) => updatePkMarkupPerUnit(e.target.value)}
            className="w-full max-w-xs border border-brand-border rounded-lg p-2.5 bg-brand-panel-alt text-brand-cream focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 outline-none transition-shadow"
          />
        )}
      </div>
      </div>
    </div>
  )
}
