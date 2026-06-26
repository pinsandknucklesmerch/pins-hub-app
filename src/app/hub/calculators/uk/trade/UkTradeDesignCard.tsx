"use client"

import { useState } from "react"

import { UK_TRADE_EMBROIDERY_MIN_STITCH_COUNT } from "../tradeEmbroideryData"
import {
  UK_TRADE_NECK_PRINT_STANDARD_POSITION,
  UK_TRADE_NECK_PRINT_TRANSFER_POSITION,
  UK_TRADE_PRINT_POSITIONS,
  type UkTradeGarment,
  type UkTradePrintPositionId,
  type UkTradePrintPositionState,
} from "./types"

const MIN_COLOR_COUNT = 1
const MAX_COLOR_COUNT = 10
const COLOR_COUNT_WARNING = "Acceptable color counts are between 1 and 10."

const UK_TRADE_STANDARD_PRINT_POSITIONS = UK_TRADE_PRINT_POSITIONS.filter(
  (position) =>
    position.value !== UK_TRADE_NECK_PRINT_STANDARD_POSITION &&
    position.value !== UK_TRADE_NECK_PRINT_TRANSFER_POSITION,
)

const UK_TRADE_NECK_PRINT_POSITIONS = UK_TRADE_PRINT_POSITIONS.filter(
  (position) =>
    position.value === UK_TRADE_NECK_PRINT_STANDARD_POSITION ||
    position.value === UK_TRADE_NECK_PRINT_TRANSFER_POSITION,
)

export type UkTradeEmbroideryKey =
  | "embroidery1"
  | "embroidery2"
  | "embroidery3"

export const UK_TRADE_EMBROIDERY_ITEMS: {
  key: UkTradeEmbroideryKey
  label: string
}[] = [
  { key: "embroidery1", label: "Embroidery 1" },
  { key: "embroidery2", label: "Embroidery 2" },
  { key: "embroidery3", label: "Embroidery 3" },
]

export type UkTradeEmbroideryState = Partial<
  Record<UkTradeEmbroideryKey, number>
>

export type UkTradeDesign = {
  garmentId?: string
  quantity: number
  positions: UkTradePrintPositionState
  embroideryItems?: UkTradeEmbroideryState
  itemLabel?: string
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function getGarmentLabel(garment: UkTradeGarment) {
  return [garment.brandName, garment.name, garment.color].filter(Boolean).join(" - ")
}

function getDefaultItemLabel(itemNumber?: number) {
  return itemNumber ? `Item #${itemNumber}` : "Item"
}

function getColorInputState(positions: UkTradePrintPositionState) {
  return UK_TRADE_PRINT_POSITIONS.reduce<
    Partial<Record<UkTradePrintPositionId, string>>
  >((nextInputs, position) => {
    const colorCount = positions[position.value] ?? 0

    if (
      colorCount > 0 &&
      position.value !== UK_TRADE_NECK_PRINT_STANDARD_POSITION &&
      position.value !== UK_TRADE_NECK_PRINT_TRANSFER_POSITION
    ) {
      nextInputs[position.value] = String(colorCount)
    }

    return nextInputs
  }, {})
}

function getEmbroideryInputState(embroideryItems?: UkTradeEmbroideryState) {
  return Object.fromEntries(
    UK_TRADE_EMBROIDERY_ITEMS.filter(
      (item) => typeof embroideryItems?.[item.key] === "number",
    ).map((item) => [item.key, String(embroideryItems?.[item.key])]),
  ) as Record<UkTradeEmbroideryKey, string>
}

function GarmentSelector({
  garments,
  value,
  onChange,
}: {
  garments: UkTradeGarment[]
  value?: string
  onChange: (garmentId: string) => void
}) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const selectedGarment = garments.find((garment) => garment.id === value)
  const displayValue = selectedGarment ? getGarmentLabel(selectedGarment) : query

  const filtered = garments.filter((garment) => {
    const queryParts = normalizeSearch(query).split(" ").filter(Boolean)

    if (queryParts.length === 0) {
      return true
    }

    const searchableText = normalizeSearch(
      [
        garment.name,
        garment.code,
        garment.altCode,
        garment.brandName,
        garment.color,
        garment.tags,
      ]
        .filter(Boolean)
        .join(" "),
    )

    return queryParts.every((part) => searchableText.includes(part))
  })

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120)
        }}
        placeholder="Search garments..."
        className="w-full rounded-lg border border-brand-border bg-brand-panel-alt p-2.5 text-brand-cream outline-none transition-shadow placeholder:text-brand-muted/70 focus:border-brand-red/60 focus:ring-2 focus:ring-brand-red/40"
      />

      {isOpen ? (
        <ul className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-brand-border bg-brand-panel shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {filtered.length === 0 ? (
            <li className="p-3 text-sm text-brand-muted/80">No garments found.</li>
          ) : (
            filtered.map((garment) => (
              <li
                key={garment.id}
                onMouseDown={() => {
                  onChange(garment.id)
                  setIsOpen(false)
                  setQuery("")
                }}
                className="flex cursor-pointer items-center justify-between whitespace-nowrap p-3 text-sm text-brand-cream/90 transition-colors hover:bg-brand-surface"
              >
                <span>{getGarmentLabel(garment)}</span>
                <span className="ml-2 font-mono text-xs text-brand-muted/80">
                  {[garment.code, garment.altCode].filter(Boolean).join(" / ")}
                </span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}

export default function UkTradeDesignCard({
  design,
  garments,
  itemNumber,
  onChange,
  onRemove,
}: {
  design: UkTradeDesign
  garments: UkTradeGarment[]
  itemNumber?: number
  onChange: (design: UkTradeDesign) => void
  onRemove?: () => void
}) {
  const [colorInputs, setColorInputs] = useState<
    Partial<Record<UkTradePrintPositionId, string>>
  >(() => getColorInputState(design.positions))
  const [embroideryInputs, setEmbroideryInputs] = useState<
    Record<UkTradeEmbroideryKey, string>
  >(() => getEmbroideryInputState(design.embroideryItems))
  const [colorError, setColorError] = useState("")

  function updateQuantity(value: number) {
    onChange({ ...design, quantity: value })
  }

  function updateGarment(garmentId: string) {
    onChange({ ...design, garmentId })
  }

  function updatePositionColor(position: UkTradePrintPositionId, colors: number) {
    onChange({
      ...design,
      positions: {
        ...design.positions,
        [position]: colors,
      },
    })
  }

  function togglePosition(position: UkTradePrintPositionId, isSelected: boolean) {
    if (isSelected) {
      setColorInputs((current) => {
        const next = { ...current }
        delete next[position]
        return next
      })
      updatePositionColor(position, 0)
      return
    }

    if (
      position !== UK_TRADE_NECK_PRINT_STANDARD_POSITION &&
      position !== UK_TRADE_NECK_PRINT_TRANSFER_POSITION
    ) {
      setColorInputs((current) => ({
        ...current,
        [position]: String(MIN_COLOR_COUNT),
      }))
    }

    updatePositionColor(position, MIN_COLOR_COUNT)
  }

  function updatePositionColorInput(
    position: UkTradePrintPositionId,
    value: string,
  ) {
    if (!/^\d*$/.test(value)) {
      return
    }

    setColorInputs((current) => ({
      ...current,
      [position]: value,
    }))

    if (value === "") {
      return
    }

    const parsedValue = Number(value)

    if (
      Number.isInteger(parsedValue) &&
      parsedValue >= MIN_COLOR_COUNT &&
      parsedValue <= MAX_COLOR_COUNT
    ) {
      updatePositionColor(position, parsedValue)
    }
  }

  function normalizePositionColorInput(position: UkTradePrintPositionId) {
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
        [position]: String(MIN_COLOR_COUNT),
      }))
      updatePositionColor(position, MIN_COLOR_COUNT)
      return
    }

    setColorError("")
    const normalizedValue = String(parsedValue)

    if (value !== normalizedValue) {
      setColorInputs((current) => ({
        ...current,
        [position]: normalizedValue,
      }))
    }

    updatePositionColor(position, parsedValue)
  }

  function updateItemLabel(value: string) {
    onChange({ ...design, itemLabel: value })
  }

  function normalizeItemLabel() {
    const trimmedValue = (design.itemLabel ?? "").trim()
    onChange({ ...design, itemLabel: trimmedValue || undefined })
  }

  function updateEmbroideryItem(
    embroideryKey: UkTradeEmbroideryKey,
    stitchCount?: number,
  ) {
    const nextEmbroideryItems = { ...(design.embroideryItems ?? {}) }

    if (typeof stitchCount === "number") {
      nextEmbroideryItems[embroideryKey] = stitchCount
    } else {
      delete nextEmbroideryItems[embroideryKey]
    }

    onChange({
      ...design,
      embroideryItems:
        Object.keys(nextEmbroideryItems).length > 0
          ? nextEmbroideryItems
          : undefined,
    })
  }

  function toggleEmbroideryItem(
    embroideryKey: UkTradeEmbroideryKey,
    isSelected: boolean,
  ) {
    if (isSelected) {
      setEmbroideryInputs((current) => {
        const next = { ...current }
        delete next[embroideryKey]
        return next
      })
      updateEmbroideryItem(embroideryKey)
      return
    }

    setEmbroideryInputs((current) => ({
      ...current,
      [embroideryKey]: String(UK_TRADE_EMBROIDERY_MIN_STITCH_COUNT),
    }))
    updateEmbroideryItem(embroideryKey, UK_TRADE_EMBROIDERY_MIN_STITCH_COUNT)
  }

  function updateEmbroideryInput(
    embroideryKey: UkTradeEmbroideryKey,
    value: string,
  ) {
    if (!/^\d*$/.test(value)) {
      return
    }

    setEmbroideryInputs((current) => ({
      ...current,
      [embroideryKey]: value,
    }))

    if (value === "") {
      return
    }

    updateEmbroideryItem(
      embroideryKey,
      Math.max(UK_TRADE_EMBROIDERY_MIN_STITCH_COUNT, Number(value)),
    )
  }

  function normalizeEmbroideryInput(embroideryKey: UkTradeEmbroideryKey) {
    const value = embroideryInputs[embroideryKey] ?? ""
    const parsedValue = Number(value)
    const normalizedValue =
      value !== "" && Number.isInteger(parsedValue)
        ? Math.max(UK_TRADE_EMBROIDERY_MIN_STITCH_COUNT, parsedValue)
        : UK_TRADE_EMBROIDERY_MIN_STITCH_COUNT

    setEmbroideryInputs((current) => ({
      ...current,
      [embroideryKey]: String(normalizedValue),
    }))
    updateEmbroideryItem(embroideryKey, normalizedValue)
  }

  const defaultItemLabel = getDefaultItemLabel(itemNumber)
  const itemLabelValue = design.itemLabel ?? defaultItemLabel
  const selectedPrintPositions = UK_TRADE_PRINT_POSITIONS.filter(
    (position) => (design.positions[position.value] || 0) > 0,
  )
  const selectedConfigurablePrintPositions = selectedPrintPositions.filter(
    (position) =>
      position.value !== UK_TRADE_NECK_PRINT_STANDARD_POSITION &&
      position.value !== UK_TRADE_NECK_PRINT_TRANSFER_POSITION,
  )
  const selectedEmbroideryItems = UK_TRADE_EMBROIDERY_ITEMS.filter(
    (item) => typeof design.embroideryItems?.[item.key] === "number",
  )
  const hasSelectedPrintAndEmbroidery =
    selectedConfigurablePrintPositions.length > 0 &&
    selectedEmbroideryItems.length > 0
  const hasConfigurableSelections =
    selectedConfigurablePrintPositions.length > 0 ||
    selectedEmbroideryItems.length > 0

  return (
    <div className="relative mb-6 min-h-[520px] w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-brand-border/80 bg-brand-panel p-6 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      {onRemove ? (
        <button
          onClick={onRemove}
          className="absolute right-4 top-4 text-brand-muted/80 transition-colors hover:text-brand-red"
          title="Remove item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      ) : null}

      <div className="mb-2">
        <input
          type="text"
          value={itemLabelValue}
          placeholder={defaultItemLabel}
          aria-label={`Item ${itemNumber ?? 1} label`}
          onChange={(event) => updateItemLabel(event.target.value)}
          onFocus={() => {
            if (!design.itemLabel) {
              onChange({ ...design, itemLabel: "" })
            }
          }}
          onBlur={normalizeItemLabel}
          className="w-64 rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2.5 text-lg font-bold text-brand-cream outline-none transition-shadow placeholder:text-brand-muted-soft focus:border-brand-red/60 focus:ring-2 focus:ring-brand-red/40"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-muted">
            Garment
          </label>
          <GarmentSelector
            garments={garments}
            value={design.garmentId}
            onChange={updateGarment}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-brand-muted">
            Quantity
          </label>
          <input
            type="number"
            min={50}
            value={design.quantity || ""}
            onChange={(event) => updateQuantity(Number(event.target.value))}
            className="w-full rounded-lg border border-brand-border bg-brand-panel-alt p-2.5 text-brand-cream outline-none transition-shadow focus:border-brand-red/60 focus:ring-2 focus:ring-brand-red/40"
          />
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-brand-muted">
          Print / Embroidery Positions
        </h4>

        <div className="mb-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              {UK_TRADE_STANDARD_PRINT_POSITIONS.map((position) => {
                const isSelected = (design.positions[position.value] || 0) > 0

                return (
                <button
                  key={position.value}
                  type="button"
                  onClick={() => togglePosition(position.value, isSelected)}
                  className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-brand-red/40 bg-brand-red/16 text-brand-red/90 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                      : "border-brand-border bg-brand-panel-alt text-brand-muted hover:border-brand-border/80 hover:bg-brand-surface"
                  }`}
                >
                  {position.label}
                </button>
              )
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              {UK_TRADE_NECK_PRINT_POSITIONS.map((position) => {
                const isSelected = (design.positions[position.value] || 0) > 0

                return (
                  <button
                    key={position.value}
                    type="button"
                    onClick={() => togglePosition(position.value, isSelected)}
                    className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-brand-red/40 bg-brand-red/16 text-brand-red/90 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        : "border-brand-border bg-brand-panel-alt text-brand-muted hover:border-brand-border/80 hover:bg-brand-surface"
                    }`}
                  >
                    {position.label}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              {UK_TRADE_EMBROIDERY_ITEMS.map((item) => {
              const isSelected =
                typeof design.embroideryItems?.[item.key] === "number"

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleEmbroideryItem(item.key, isSelected)}
                  className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-brand-red/40 bg-brand-red/16 text-brand-red/90 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                      : "border-brand-border bg-brand-panel-alt text-brand-muted hover:border-brand-border/80 hover:bg-brand-surface"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {hasConfigurableSelections ? (
          <div className="space-y-4 rounded-xl border border-brand-border/60 bg-brand-panel-alt/50 p-4">
            <div className="flex flex-wrap gap-4">
              {selectedConfigurablePrintPositions.map((position) => (
                <div
                  key={position.value}
                  className="flex min-h-[104px] w-full max-w-[180px] flex-col rounded-lg border border-brand-border bg-brand-panel p-3"
                  >
                  <label className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-red/90">
                    {position.label}
                  </label>

                  <span className="mb-1 text-[11px] font-semibold text-brand-muted/80">
                    Print Colours
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={colorInputs[position.value] ?? ""}
                    onChange={(event) =>
                      updatePositionColorInput(
                        position.value,
                        event.target.value,
                      )
                    }
                    onBlur={() => normalizePositionColorInput(position.value)}
                    className="w-full rounded-lg border border-brand-border bg-brand-panel-alt p-2.5 text-sm text-brand-cream outline-none transition-shadow focus:border-brand-red/60 focus:ring-2 focus:ring-brand-red/40"
                  />

                  <div className="min-h-[18px]">
                    {colorError ? (
                      <p className="mt-1 text-xs text-brand-red/80">
                        {colorError}
                      </p>
                      ) : null}
                  </div>
                </div>
              ))}
            </div>

            {hasSelectedPrintAndEmbroidery ? (
              <div className="border-t border-brand-border/70" />
            ) : null}

            <div className="flex flex-wrap gap-4">
              {selectedEmbroideryItems.map((item) => (
                <div
                  key={item.key}
                  className="flex min-h-[104px] w-full max-w-[180px] flex-col rounded-lg border border-brand-red/40 bg-brand-red/10 p-3 shadow-[0_0_15px_rgba(239,68,68,0.08)]"
                >
                  <label className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-red/90">
                    {item.label}
                  </label>
                  <span className="mb-1 text-[11px] font-semibold text-brand-muted/80">
                    Stitch Count
                  </span>
                  <input
                    type="number"
                    min={UK_TRADE_EMBROIDERY_MIN_STITCH_COUNT}
                    step={1}
                    value={embroideryInputs[item.key] ?? ""}
                    onChange={(event) =>
                      updateEmbroideryInput(item.key, event.target.value)
                    }
                    onBlur={() => normalizeEmbroideryInput(item.key)}
                    className="w-full rounded-lg border border-brand-border bg-brand-panel-alt p-2.5 text-sm text-brand-cream outline-none transition-shadow focus:border-brand-red/60 focus:ring-2 focus:ring-brand-red/40"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
