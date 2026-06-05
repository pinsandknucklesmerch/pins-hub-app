"use client"
import { toast } from "sonner"
import { useMemo, useState } from "react"
import DesignCard, {
  type Design,
  calculateDesignCosts,
  type DesignCostBreakdown,
  getPrintUnitPrices,
  PRINT_POSITIONS
} from "@/components/DesignCard"
import type { Garment, GarmentMarkup, PrintPrice } from "@prisma/client"

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
  const vatRate = 27 // Hardcoded VAT Rate at 27%
  const CURRENCY = "€"

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

  const displayProductionSubtotalExclVat = hasGarmentSelected ? productionSubtotalExclVat : 0
  const displayPinsSubtotalExclVat = hasGarmentSelected ? pinsSubtotalExclVat : 0
  const displayPinsTotalInclVat = hasGarmentSelected ? pinsTotalInclVat : 0

  const handleCopyClick = async () => {
    if (!hasGarmentSelected) return

    let body = "\n\n"
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

      body += `Item ${idx + 1}:\n${garmentCode}  ${garmentName} (${positionsText})\n`
      body += `${d.quantity} x ${CURRENCY}${unitExclVat.toFixed(2)} (excl vat) ea = ${CURRENCY}${totalInclVat.toFixed(2)}\n\n`
    })

   await copyToClipboard(body)
    toast.success("Quote copied to clipboard")
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

      {/* Pricing Container - always mounted so selecting a garment does not shift layout */}
      <div className={`mt-8 min-h-[360px] p-6 bg-zinc-100/30 dark:bg-zinc-900/10 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl ${hasGarmentSelected ? "" : "opacity-60"}`}>
          
          {/* Cost Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pins Price Card (Customer Quote) */}
            <div 
              onClick={handleCopyClick}
              className="bg-[#0b0c10] border border-blue-500/30 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.06)] hover:shadow-[0_0_25px_rgba(59,130,246,0.12)] hover:border-blue-500/50 cursor-pointer"
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
            <div className="bg-[#0b0c10] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_25px_rgba(255,255,255,0.04)] hover:border-zinc-700">
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
                  <div>
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
                  <div>
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
                </div>

              </div>
            </div>
          </div>

      </div>
    </div>
  )
}
