"use client"
import { toast } from "sonner"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import DesignCard, {
  type Design,
  calculateDesignCosts,
  type DesignCostBreakdown,
  getPrintUnitPrices,
  PRINT_POSITIONS
} from "@/components/DesignCard"
import type { Garment, GarmentMarkup, PrintPrice } from "@prisma/client"

const DELIVERY_RATES = [
  { country: "Austria", cost: 25, deliveryTime: "1 day" },
  { country: "Czechia", cost: 25, deliveryTime: "2 days" },
  { country: "Germany", cost: 25, deliveryTime: "2 days" },
  { country: "Romania", cost: 25, deliveryTime: "2 days" },
  { country: "Slovenia", cost: 25, deliveryTime: "1 day" },
  { country: "Croatia", cost: 30, deliveryTime: "3 days" },
  { country: "Slovakia", cost: 30, deliveryTime: "2 days" },
  { country: "Italy", cost: 40, deliveryTime: "3-4 days" },
  { country: "France", cost: 45, deliveryTime: "3 days" },
  { country: "Poland", cost: 45, deliveryTime: "2 days" },
  { country: "Netherlands", cost: 45, deliveryTime: "2 days" },
  { country: "Greece", cost: 50, deliveryTime: "6 days" },
  { country: "Portugal", cost: 50, deliveryTime: "4 days" },
  { country: "Spain", cost: 50, deliveryTime: "3 days" },
  { country: "Belgium", cost: 55, deliveryTime: "2 days" },
  { country: "Bulgaria", cost: 55, deliveryTime: "3 days" },
  { country: "Denmark", cost: 55, deliveryTime: "3 days" },
  { country: "Estonia", cost: 55, deliveryTime: "4 days" },
  { country: "Latvia", cost: 55, deliveryTime: "3 days" },
  { country: "Lithuania", cost: 55, deliveryTime: "3 days" },
  { country: "Luxembourg", cost: 55, deliveryTime: "2 days" },
  { country: "Monaco", cost: 55, deliveryTime: "3 days" },
  { country: "Sweden", cost: 55, deliveryTime: "3 days" },
  { country: "England", cost: 65, deliveryTime: "4 days" },
  { country: "Ireland", cost: 65, deliveryTime: "5 days" }
] as const

const BOX_CAPACITY_GUIDE_ITEMS = [
  { label: "T-Shirts", capacity: "100 per box" },
  { label: "Hoodies", capacity: "20-25 per box" },
  { label: "Long Sleeves", capacity: "60 per box" },
  { label: "Beanies", capacity: "150 per box" },
  { label: "Caps", capacity: "100-150 per box" },
  { label: "Tote Bags", capacity: "100-150 per box" }
]

export default function CalculatorClient({
  garments,
  printPrices,
  garmentMarkups
}: {
  garments: Garment[]
  printPrices: PrintPrice[]
  garmentMarkups: GarmentMarkup[]
}) {
  const [designs, setDesigns] = useState<Design[]>([
    {
      quantity: 50,
      positions: { FRONT: 1 },
      pkMarkupEnabled: false,
      pkMarkupPerUnit: 0
    }
  ])

  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false)
  const [isDeliveryHelperEnabled, setIsDeliveryHelperEnabled] = useState(false)
  const [isBoxCapacityGuideOpen, setIsBoxCapacityGuideOpen] = useState(false)
  const [deliveryCountry, setDeliveryCountry] = useState("Germany")
  const [deliveryBoxCount, setDeliveryBoxCount] = useState(1)
  const [deliveryMarkupEnabled, setDeliveryMarkupEnabled] = useState(false)
  const [deliveryMarkupInput, setDeliveryMarkupInput] = useState("0")
  const boxCapacityGuideTitleId = useId()
  const boxCapacityGuideDialogRef = useRef<HTMLDivElement>(null)
  const boxCapacityGuideTriggerRef = useRef<HTMLButtonElement>(null)
  // EU pricing implementation. Extract shared calculator helpers from here once additional regional calculators are added.
  const vatRate = 27 // Hardcoded VAT Rate at 27%
  const CURRENCY = "€"

  useEffect(() => {
    if (!isBoxCapacityGuideOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const triggerElement = boxCapacityGuideTriggerRef.current
    document.body.style.overflow = "hidden"

    const getFocusableElements = () => {
      const dialog = boxCapacityGuideDialogRef.current
      if (!dialog) {
        return []
      }

      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true")
    }

    getFocusableElements()[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setIsBoxCapacityGuideOpen(false)
        return
      }

      if (event.key !== "Tab") {
        return
      }

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      triggerElement?.focus()
    }
  }, [isBoxCapacityGuideOpen])

  function addDesign() {
    setDesigns([
      ...designs,
      {
        quantity: 50,
        positions: { FRONT: 1 },
        pkMarkupEnabled: false,
        pkMarkupPerUnit: 0
      }
    ])
  }

  function updateDesign(index: number, updated: Design) {
    const newDesigns = [...designs]
    newDesigns[index] = updated
    setDesigns(newDesigns)
  }

  function removeDesign(index: number) {
    const newDesigns = [...designs]
    newDesigns.splice(index, 1)
    setDesigns(newDesigns)
  }

  const breakdowns: DesignCostBreakdown[] = useMemo(() => {
    return designs.map((d) => calculateDesignCosts(d, garments, printPrices, garmentMarkups))
  }, [designs, garments, printPrices, garmentMarkups])

  const totalQty = useMemo(() => {
    return breakdowns.reduce((sum, b) => sum + b.quantity, 0)
  }, [breakdowns])

  const orderTotals = useMemo(() => {
    let production = 0
    let pins = 0
    let base = 0
    let markup = 0
    let pkMarkup = 0

    for (const b of breakdowns) {
      production += b.productionCost
      pins += b.pinsCost
      base += b.baseCost
      markup += b.markupCost
      pkMarkup += b.pkMarkupCost
    }

    return { production, pins, base, markup, pkMarkup, total: production + pins + base + markup + pkMarkup }
  }, [breakdowns])

  const copyToClipboard = async (text: string) => {
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

  // Calculations for Production Cost (Sales Reference - excl VAT only)
  const productionSubtotalExclVat = orderTotals.production + orderTotals.base

  // Calculations for Pins Cost (Customer Price includes Garment Base Cost + Pins Print Cost + Garment Markup + optional PK Markup)
  const pinsSubtotalExclVat = orderTotals.pins + orderTotals.base + orderTotals.markup + orderTotals.pkMarkup
  const pinsTotalInclVat = pinsSubtotalExclVat * (1 + vatRate / 100)

  // Check if at least one design has a selected garment
  const hasGarmentSelected = useMemo(() => {
    return designs.some((d) => d.garmentId !== undefined && d.garmentId !== "")
  }, [designs])

  const selectedDeliveryRate = useMemo(() => {
    return DELIVERY_RATES.find((rate) => rate.country === deliveryCountry) ?? DELIVERY_RATES[0]
  }, [deliveryCountry])

  const deliveryMarkupPerBox = useMemo(() => {
    const parsedValue = Number(deliveryMarkupInput)
    return Number.isFinite(parsedValue) ? parsedValue : 0
  }, [deliveryMarkupInput])

  const deliveryBaseExclVat = useMemo(() => {
    return deliveryBoxCount * selectedDeliveryRate.cost
  }, [deliveryBoxCount, selectedDeliveryRate])

  const deliveryMarkupExclVat = useMemo(() => {
    return deliveryMarkupEnabled ? deliveryBoxCount * deliveryMarkupPerBox : 0
  }, [deliveryBoxCount, deliveryMarkupEnabled, deliveryMarkupPerBox])

  const deliverySubtotalExclVat = useMemo(() => {
    return deliveryBaseExclVat + deliveryMarkupExclVat
  }, [deliveryBaseExclVat, deliveryMarkupExclVat])

  const deliveryVatAmount = useMemo(() => {
    return deliverySubtotalExclVat * (vatRate / 100)
  }, [deliverySubtotalExclVat, vatRate])

  const deliveryTotalInclVat = useMemo(() => {
    return deliverySubtotalExclVat + deliveryVatAmount
  }, [deliverySubtotalExclVat, deliveryVatAmount])

  const displayProductionSubtotalExclVat = hasGarmentSelected ? productionSubtotalExclVat : 0
  const displayPinsSubtotalExclVat = hasGarmentSelected ? pinsSubtotalExclVat : 0
  const displayPinsTotalInclVat = hasGarmentSelected ? pinsTotalInclVat : 0
  const displayPinsProfit = hasGarmentSelected ?  pinsSubtotalExclVat - productionSubtotalExclVat : 0

  const handleCopyClick = async () => {
    if (!hasGarmentSelected) return

    // let body = "EU Price Calculator Quote\n\n"
     let body = ""
    breakdowns.forEach((b, idx) => {
      const d = designs[idx]
      if (!d) return
      const garment = garments.find((g) => g.id === d.garmentId)

      const garmentCode = garment?.code || ""
      const garmentName = garment?.name || "No garment"
      const positionsText = Object.entries(d.positions).filter(([, c]) => c > 0).map(([p, c]) => `${c} Col ${PRINT_POSITIONS.find((pos) => pos.value === p)?.label || p}`).join(", ")
      
      const baseCostPerUnit = d.quantity > 0 ? b.baseCost / d.quantity : 0
      const markupCostPerUnit = d.quantity > 0 ? b.markupCost / d.quantity : 0
      const pinsCostPerUnit = d.quantity > 0 ? b.pinsCost / d.quantity : 0
      const pkMarkupCostPerUnit = d.quantity > 0 ? b.pkMarkupCost / d.quantity : 0
      
      const unitExclVat = baseCostPerUnit + markupCostPerUnit + pinsCostPerUnit + pkMarkupCostPerUnit
      const subtotalExclVat = b.baseCost + b.pinsCost + b.markupCost + b.pkMarkupCost
      const totalInclVat = subtotalExclVat * (1 + vatRate / 100)

      body += `Item ${idx + 1}:\n\n${garmentCode}  ${garmentName} (${positionsText})\n`
      body += `${d.quantity} x ${CURRENCY}${unitExclVat.toFixed(2)} (excl vat) ea = ${CURRENCY}${totalInclVat.toFixed(2)}\n\n`
    })

    await copyToClipboard(body)
    toast.success("EU Price Calculator quote copied to clipboard")
  }

  const handleDeliveryCopyClick = async () => {
    if (!isDeliveryHelperEnabled) return

    const deliveryInfo = [
      // "EU Price Calculator Delivery Helper",
      "",
      `Delivery Country: ${selectedDeliveryRate.country}`,
      `Delivery Time: ${selectedDeliveryRate.deliveryTime}`,
      `Boxes: ${deliveryBoxCount}`,
      `Cost Per Box: ${CURRENCY}${selectedDeliveryRate.cost} excl. VAT`,
      `Total Delivery Cost Incl. VAT: ${CURRENCY}${deliveryTotalInclVat.toFixed(2)}`
    ].join("\n")

    await copyToClipboard(deliveryInfo)
    toast.success("EU Price Calculator delivery info copied to clipboard")
  }

  return (
    <div className="w-full max-w-4xl">
      {designs.map((design, i) => (
        <DesignCard
          key={i}
          design={design}
          garments={garments}
          itemNumber={i + 1}
          onChange={(updated) => updateDesign(i, updated)}
          onRemove={() => removeDesign(i)}
        />
      ))}

      <div className="mt-2">
        <button
          onClick={addDesign}
          className="bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 transition-all px-6 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] flex items-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Item
        </button>
      </div>

      <div className="mt-6 bg-[#0b0c10] border border-red-500/20 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.08)]">
        <div className="px-6 py-4 bg-[#111219] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
              <input
                type="checkbox"
                checked={isDeliveryHelperEnabled}
                onChange={(e) => setIsDeliveryHelperEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-[#0b0c10] text-red-500 focus:ring-red-500/50"
              />
              <span>Delivery Costs</span>
            </label>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400/80">
              Sales Helper
            </span>
          </div>

          <button
            ref={boxCapacityGuideTriggerRef}
            type="button"
            onClick={() => setIsBoxCapacityGuideOpen(true)}
            className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-800 bg-[#101116] px-3 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-300"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 text-[11px] text-red-400">
              i
            </span>
            Box Capacity Guide
          </button>
        </div>

        {isDeliveryHelperEnabled && (
          <div className="border-t border-red-500/10 px-6 py-5">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Delivery Area
                  </label>
                  <select
                    value={deliveryCountry}
                    onChange={(e) => setDeliveryCountry(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-[#111219] p-2.5 text-white outline-none transition-shadow focus:border-red-500/50 focus:ring-2 focus:ring-red-500/50"
                  >
                    {DELIVERY_RATES.map((rate) => (
                      <option key={rate.country} value={rate.country}>
                        {rate.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Number of Boxes
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={deliveryBoxCount}
                    onChange={(e) => setDeliveryBoxCount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full rounded-lg border border-zinc-800 bg-[#111219] p-2.5 text-white outline-none transition-shadow focus:border-red-500/50 focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Cost Per Box
                  </label>
                  <div className="rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-sm font-semibold text-zinc-200">
                    {CURRENCY}{selectedDeliveryRate.cost} <span className="text-zinc-500">excl. VAT</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Delivery Time
                  </label>
                  <div className="rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-sm font-semibold text-zinc-200">
                    {selectedDeliveryRate.deliveryTime}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                    <input
                      type="checkbox"
                      checked={deliveryMarkupEnabled}
                      onChange={(e) => setDeliveryMarkupEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-700 bg-[#111219] text-red-500 focus:ring-red-500/50"
                    />
                    Delivery Markup
                  </label>
                  {deliveryMarkupEnabled ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={deliveryMarkupInput}
                      onChange={(e) => {
                        if (!/^-?\d*\.?\d*$/.test(e.target.value)) return
                        setDeliveryMarkupInput(e.target.value)
                      }}
                      placeholder="Markup per box excl. VAT"
                      className="mt-2 w-full rounded-lg border border-zinc-800 bg-[#111219] p-2.5 text-white outline-none transition-shadow focus:border-red-500/50 focus:ring-2 focus:ring-red-500/50 placeholder:text-zinc-500"
                    />
                  ) : (
                    <div className="mt-2 rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-sm text-zinc-500">
                      No delivery markup applied
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleDeliveryCopyClick}
                className="rounded-xl border border-zinc-800 bg-[#0f1016] p-4 text-left transition-colors hover:border-red-500/30 hover:bg-[#13151d]"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Delivery Summary
                  </p>
                  <span className="rounded-lg border border-red-500/20 bg-red-600/10 px-3 py-2 text-xs font-bold text-red-400 transition-colors">
                    Copy Delivery Info
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 text-zinc-400">
                    <span>Selected Country</span>
                    <span className="font-mono text-zinc-200">{selectedDeliveryRate.country}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-zinc-400">
                    <span>Delivery Time</span>
                    <span className="font-mono text-zinc-200">{selectedDeliveryRate.deliveryTime}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-zinc-400">
                    <span>Cost Per Box</span>
                    <span className="font-mono text-zinc-200">{CURRENCY}{selectedDeliveryRate.cost} excl. VAT</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-zinc-400">
                    <span>Number of Boxes</span>
                    <span className="font-mono text-zinc-200">{deliveryBoxCount}</span>
                  </div>
                  {deliveryMarkupEnabled ? (
                    <div className="flex items-center justify-between gap-4 text-zinc-400">
                      <span>Delivery Markup</span>
                      <span className="font-mono text-zinc-200">{CURRENCY}{deliveryMarkupExclVat.toFixed(2)} excl. VAT</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-4 text-zinc-400">
                    <span>Subtotal Excl. VAT</span>
                    <span className="font-mono text-zinc-200">{CURRENCY}{deliverySubtotalExclVat.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-zinc-400">
                    <span>VAT ({vatRate}%)</span>
                    <span className="font-mono text-zinc-200">{CURRENCY}{deliveryVatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-zinc-800 pt-3 text-zinc-300">
                    <span className="font-semibold">Total Delivery Cost Incl. VAT</span>
                    <span className="font-mono font-bold text-red-300">{CURRENCY}{deliveryTotalInclVat.toFixed(2)}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {isBoxCapacityGuideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          onClick={() => setIsBoxCapacityGuideOpen(false)}
        >
          <div
            ref={boxCapacityGuideDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={boxCapacityGuideTitleId}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#0b0c10] shadow-[0_0_40px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 bg-[#111219] px-5 py-4 sm:px-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-400/80">
                  Sales Reference
                </p>
                <h2 id={boxCapacityGuideTitleId} className="text-lg font-bold text-white sm:text-xl">
                  Box Capacity Guide
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsBoxCapacityGuideOpen(false)}
                className="rounded-full border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-300"
                aria-label="Close Box Capacity Guide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
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
            </div>

            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm leading-6 text-zinc-300">
                  Use this guide as a quick packing reference when estimating delivery box counts. Capacities are approximate and can vary with garment thickness, folding, and mixed-product orders.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-400">
                    Approximate Capacities
                  </h3>
                  <span className="text-[11px] font-medium text-zinc-500">Per standard box</span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {BOX_CAPACITY_GUIDE_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-zinc-800 bg-[#111219] px-4 py-3 shadow-[0_0_18px_rgba(239,68,68,0.04)]"
                    >
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-sm text-red-300">{item.capacity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Container - always mounted so selecting a garment does not shift layout */}
      <div className={`mt-8 min-h-[360px] p-6 bg-zinc-100/30 dark:bg-zinc-900/10 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl ${hasGarmentSelected ? "" : "opacity-60"}`}>
          
          {/* Cost Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pins Price Card (Customer Quote) */}
            <div
              onClick={handleCopyClick}
              className="md:order-2 bg-[#0b0c10] border border-blue-500/30 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.06)] hover:shadow-[0_0_25px_rgba(59,130,246,0.12)] hover:border-blue-500/50 cursor-pointer"
            >
              <div className="p-6 flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">PINS PRICE (incl Vat)</p>
                  <span className="bg-blue-500/10 text-blue-400 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Click to Copy</span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl md:text-5xl font-black text-sky-400 tabular-nums">
                    {CURRENCY}{displayPinsTotalInclVat.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Production Costs Card (Sales Team Reference - Excl VAT only) */}
            <div className="md:order-1 bg-[#0b0c10] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_25px_rgba(255,255,255,0.04)] hover:border-zinc-700">
              <div className="p-6 flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">PRODUCTION COSTS</p>
                  {/* <span className="bg-zinc-800 text-zinc-400 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Sales Comparison (Excl VAT)</span> */}
                </div>
                <div className="mb-6">
                  <span className="text-4xl md:text-5xl font-black text-zinc-300 tabular-nums">
                    {CURRENCY}{displayProductionSubtotalExclVat.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Unified Quote Breakdown Dropdown */}
          <div className="mt-6 bg-[#0b0c10] border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <button
              onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
              className="w-full px-6 py-4 flex items-center justify-between bg-[#111219] hover:bg-[#161722] text-zinc-400 hover:text-white transition-colors cursor-pointer border-none outline-none"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Breakdown</span>
              <svg
                className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${isBreakdownOpen ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isBreakdownOpen ? "max-h-[2500px] opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="px-6 pb-6 pt-4 bg-[#0e0f14] border-t border-zinc-900/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* PINS PRICE BREAKDOWN SECTION */}
                  <div className="md:order-2">
                    <h3 className="text-xs font-black text-sky-400 uppercase tracking-widest mb-3 pb-1 border-b border-sky-500/20">Pins Price Breakdown</h3>
                    <div className="space-y-4">
                      {breakdowns.map((b, idx) => {
                        const d = designs[idx]
                        if (!d) return null
                        const garment = garments.find((g) => g.id === d.garmentId)
                        
                            const baseCostPerUnit = d.quantity > 0 ? b.baseCost / d.quantity : 0
                            const markupCostPerUnit = d.quantity > 0 ? b.markupCost / d.quantity : 0
                            const pinsCostPerUnit = d.quantity > 0 ? b.pinsCost / d.quantity : 0
                            const pkMarkupCostPerUnit = d.quantity > 0 ? b.pkMarkupCost / d.quantity : 0
                            const totalUnitCost = baseCostPerUnit + markupCostPerUnit + pinsCostPerUnit + pkMarkupCostPerUnit
                            const pinsSubtotalExclVat = (b.baseCost + b.pinsCost + b.markupCost + b.pkMarkupCost).toFixed(2)

                        return (
                          <div key={idx} className="space-y-3 pb-3 border-b border-zinc-900 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                              <span>Item #{idx + 1} - {garment?.name || "No garment"}</span>
                              <span className="shrink-0 whitespace-nowrap font-mono text-zinc-400">{d.quantity} units</span>
                            </div>
                            
                            {/* Garment Base Supply Price */}
                            {garment && (
                              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm text-zinc-400">
                                <span className="min-w-0 leading-snug">Garment Base (Supply) Price</span>
                                <span className="font-mono shrink-0 whitespace-nowrap text-xs md:text-sm font-mono text-zinc-300">{CURRENCY}{garment.basePrice.toFixed(2)} / unit</span>
                              </div>
                            )}

                            {/* Garment Markup */}
                            {garment && (
                              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm text-zinc-400">
                                <span className="min-w-0 leading-snug">Garment Markup ({garment.type})</span>
                                <span className="font-mono text-zinc-300">
                                  {CURRENCY}{((garmentMarkups.find((m) => m.garmentType === garment.type)?.markupValue) || 0).toFixed(2)} / unit
                                </span>
                              </div>
                            )}

                            {Object.keys(d.positions).filter((pos) => d.positions[pos] > 0).map((pos) => {
                              const posLabel = PRINT_POSITIONS.find((p) => p.value === pos)?.label || pos
                              const unitPrices = getPrintUnitPrices(pos, d, printPrices)
                              const colorCount = d.positions[pos]
                              const priceLabel = unitPrices.isFixedPrice ? "fixed" : `${colorCount} col`

                              return (
                                <div key={pos} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm text-zinc-400">
                                  <span className="min-w-0 leading-snug">{posLabel} Pins ({priceLabel})</span>
                                  <span className="shrink-0 whitespace-nowrap text-xs md:text-sm font-mono text-zinc-300">{CURRENCY}{unitPrices.pinsPrice.toFixed(2)} / unit</span>
                                </div>
                                )
                              })}

                            {d.pkMarkupEnabled && (
                              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm text-zinc-400">
                                <span className="min-w-0 leading-snug">PK Markup</span>
                                <span className="shrink-0 whitespace-nowrap text-xs md:text-sm font-mono text-zinc-300">{CURRENCY}{pkMarkupCostPerUnit.toFixed(2)} / unit</span>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm font-semibold">
                              <span className="min-w-0 text-zinc-500 leading-snug">Total Unit Cost (excl VAT)</span>
                              <span className="shrink-0 whitespace-nowrap text-xs md:text-sm font-mono text-cyan-400 font-bold">{CURRENCY}{totalUnitCost.toFixed(2)} / unit</span>
                            </div>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm font-semibold">
                              <span className="min-w-0 text-zinc-500 leading-snug">Subtotal ({d.quantity} units, excl VAT)</span>
                              <span className="shrink-0 whitespace-nowrap text-xs md:text-sm font-mono text-white">{CURRENCY}{pinsSubtotalExclVat}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* PRODUCTION COSTS BREAKDOWN SECTION */}
                  <div className="md:order-1">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 pb-1 border-b border-zinc-800">Production Cost Breakdown</h3>
                    <div className="space-y-4">
                      {breakdowns.map((b, idx) => {
                        const d = designs[idx]
                        if (!d) return null
                        const garment = garments.find((g) => g.id === d.garmentId)
                        const baseCostPerUnit = d.quantity > 0 ? b.baseCost / d.quantity : 0
                        const prodCostPerUnit = d.quantity > 0 ? b.productionCost / d.quantity : 0
                        const totalUnitCost = baseCostPerUnit + prodCostPerUnit

                        return (
                          <div key={idx} className="space-y-3 pb-3 border-b border-zinc-900 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                              <span>Item #{idx + 1} - {garment?.name || "No garment"}</span>
                              <span className="shrink-0 whitespace-nowrap font-mono text-zinc-400">{d.quantity} units</span>
                            </div>
                            {garment && (
                              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm text-zinc-400">
                                <span className="min-w-0 leading-snug">Garment Base (Supply) Price</span>
                                <span className="font-mono text-zinc-300">{CURRENCY}{garment.basePrice.toFixed(2)} / unit</span>
                              </div>
                            )}
                            {Object.keys(d.positions).filter((pos) => d.positions[pos] > 0).map((pos) => {
                              const posLabel = PRINT_POSITIONS.find((p) => p.value === pos)?.label || pos
                              const unitPrices = getPrintUnitPrices(pos, d, printPrices)
                              const colorCount = d.positions[pos]
                              const priceLabel = unitPrices.isFixedPrice ? "fixed" : `${colorCount} col`

                              return (
                                <div key={pos} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm text-zinc-400">
                                  <span>{posLabel} Print Print Production ({priceLabel})</span>
                                  <span className="font-mono shrink-0 whitespace-nowrap text-xs md:text-sm font-mono text-zinc-300">{CURRENCY}{unitPrices.productionPrice.toFixed(2)} / unit</span>
                                </div>
                              )
                            })}
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm font-semibold">
                              <span className="text-zinc-500">Unit Cost (excl VAT)</span>
                              <span className="shrink-0 whitespace-nowrap text-xs md:text-sm font-mono text-cyan-400 font-bold">{CURRENCY}{totalUnitCost.toFixed(2)} / unit</span>
                            </div>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm font-semibold">
                              <span className="min-w-0 text-zinc-500 leading-snug">Subtotal ({d.quantity} units, excl VAT)</span>
                              <span className="font-mono text-white">{CURRENCY}{(b.baseCost + b.productionCost).toFixed(2)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </div>

                {/* COMBINED SUMMARY FOOTER */}
                <div className="pt-4 border-t-2 border-zinc-800 space-y-2 text-xs font-semibold mt-6">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Production Subtotal ({totalQty} units, excl VAT)</span>
                    <span className="font-mono shrink-0 whitespace-nowrap text-xs md:text-sm font-mono text-zinc-300">{CURRENCY}{displayProductionSubtotalExclVat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Pins Subtotal ({totalQty} units, excl VAT)</span>
                    <span className="font-mono shrink-0 whitespace-nowrap text-xs md:text-sm font-mono text-zinc-300">{CURRENCY}{displayPinsSubtotalExclVat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Pins Profit ({totalQty} units, excl VAT)</span>
                  <span className="font-mono shrink-0 whitespace-nowrap text-xs md:text-sm font-mono text-sky-300">{CURRENCY}{displayPinsProfit.toFixed(2)}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

      </div>
    </div>
  )
}
