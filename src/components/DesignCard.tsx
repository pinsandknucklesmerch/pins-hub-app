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

export type Design = {
  garmentId?: string
  quantity: number
  positions: Record<string, number>
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
  garmentName?: string
  quantity: number
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

  return {
    productionCost: prod,
    pinsCost: pins,
    baseCost,
    markupCost,
    pkMarkupCost,
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
        className="w-full border border-zinc-800 rounded-lg p-2.5 bg-[#111219] text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-shadow placeholder:text-zinc-500"
      />
      {isOpen && (
        <ul className="absolute z-10 min-w-full w-max mt-2 max-h-60 overflow-auto bg-[#0b0c10] border border-zinc-800 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {filtered.length === 0 ? (
            <li className="p-3 text-sm text-zinc-500">No garments found.</li>
          ) : (
            filtered.map((g) => (
              <li
                key={g.id}
                onMouseDown={() => {
                  onChange(g.id)
                  setIsOpen(false)
                  setQuery("")
                }}
                className="p-3 text-sm hover:bg-[#161722] cursor-pointer text-zinc-300 flex justify-between items-center whitespace-nowrap transition-colors"
              >
                <span>{getGarmentLabel(g)}</span>
                <span className="text-zinc-500 text-xs ml-2 font-mono">
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



  return (
    <div className="relative w-full min-h-[380px] bg-[#0b0c10] border border-zinc-800/80 p-6 mb-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-4 right-4 text-zinc-500 hover:text-red-500 transition-colors"
          title="Remove design"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      )}
      <label className="block text-lg font-bold text-zinc-300 mb-2">
        {itemNumber ? `Item #${itemNumber}` : "Item"}
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Garment</label>
          <GarmentSelector 
            garments={garments} 
            value={design.garmentId} 
            onChange={updateGarment} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Quantity</label>
          <input
            type="number"
            min={50}
            value={design.quantity || ""}
            onChange={(e) => updateQuantity(Number(e.target.value))}
            className="w-full border border-zinc-800 rounded-lg p-2.5 bg-[#111219] text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-shadow"
          />
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-zinc-400 mb-3">Print Positions</h4>

        <div className="flex flex-wrap gap-3 mb-4">
          {PRINT_POSITIONS.map((pos) => {
            const isSelected = (design.positions[pos.value] || 0) > 0
            return (
              <button
                key={pos.value}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    updatePositionColor(pos.value, 0)
                  } else {
                    updatePositionColor(pos.value, 1)
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    : "bg-[#111219] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-[#161722]"
                }`}
              >
                {pos.label}
              </button>
            )
          })}
        </div>

        {Object.keys(design.positions).some(p => design.positions[p] > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border border-zinc-800/50 bg-[#111219]/50 rounded-xl">
            {PRINT_POSITIONS.filter(pos => (design.positions[pos.value] || 0) > 0).map((pos) => (
              <div key={pos.value} className="flex flex-col">
                <label className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">{pos.label} Colors</label>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={design.positions[pos.value]}
                  onChange={(e) => updatePositionColor(pos.value, parseInt(e.target.value) || 1)}
                  className="w-full border border-zinc-800 rounded-lg p-2.5 bg-[#0b0c10] text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-shadow"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <input
              type="checkbox"
              checked={design.pkMarkupEnabled ?? false}
              onChange={(e) => updatePkMarkupEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-[#111219] text-red-500 focus:ring-red-500/50"
            />
            PK Markup
          </label>
          {design.pkMarkupEnabled && (
            <input
              type="text"
              inputMode="decimal"
              value={design.pkMarkupInput ?? String(design.pkMarkupPerUnit ?? 0)}
              onChange={(e) => updatePkMarkupPerUnit(e.target.value)}
              className="w-full max-w-xs border border-zinc-800 rounded-lg p-2.5 bg-[#111219] text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-shadow"
            />
          )}
        </div>
      </div>
    </div>
  )
}
