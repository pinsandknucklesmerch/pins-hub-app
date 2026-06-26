"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  createCommercialInvoiceCommodityCode,
  deleteCommercialInvoiceCommodityCode,
  updateCommercialInvoiceCommodityCode,
} from "../../commercial-invoices/actions"
import type {
  CommercialInvoiceCommodityCodePayload,
  CommercialInvoiceCommodityCodeRecord,
} from "../../commercial-invoices/types"

const EMPTY_COMMODITY_FORM: CommercialInvoiceCommodityCodePayload = {
  label: "",
  productType: "",
  material: "",
  commodityCode: "",
  description: "",
  notes: "",
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function getCommodityLabel(item: CommercialInvoiceCommodityCodeRecord) {
  const material = item.material ? ` · ${item.material}` : ""
  return `${item.label} · ${item.commodityCode}${material}`
}

function getCommoditySearchText(code: CommercialInvoiceCommodityCodeRecord) {
  return normalizeSearch(
    [code.label, code.productType, code.material, code.commodityCode, code.description, code.notes].join(" "),
  )
}

function preview(value: string) {
  return value.trim() || "-"
}

export default function CommodityCodeReferenceClient({
  initialCommodityCodes,
}: {
  initialCommodityCodes: CommercialInvoiceCommodityCodeRecord[]
}) {
  const [commodityCodes, setCommodityCodes] = useState(initialCommodityCodes)
  const [search, setSearch] = useState("")
  const [editingCommodityId, setEditingCommodityId] = useState<string | null>(null)
  const [commodityForm, setCommodityForm] = useState<CommercialInvoiceCommodityCodePayload>(EMPTY_COMMODITY_FORM)
  const [pendingDeleteId, setPendingDeleteId] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const isModalOpen = editingCommodityId !== null
  const isExistingRecord = Boolean(editingCommodityId)

  const filteredCommodityCodes = useMemo(() => {
    const queryParts = normalizeSearch(search).split(" ").filter(Boolean)
    if (!queryParts.length) return commodityCodes
    return commodityCodes.filter((code) => {
      const searchable = getCommoditySearchText(code)
      return queryParts.every((part) => searchable.includes(part))
    })
  }, [commodityCodes, search])

  function openNewCommodityCode() {
    setEditingCommodityId("")
    setCommodityForm(EMPTY_COMMODITY_FORM)
    setPendingDeleteId("")
  }

  function openEditCommodityCode(code: CommercialInvoiceCommodityCodeRecord) {
    setEditingCommodityId(code.id)
    setCommodityForm({
      label: code.label,
      productType: code.productType,
      material: code.material,
      commodityCode: code.commodityCode,
      description: code.description,
      notes: code.notes,
    })
    setPendingDeleteId("")
  }

  function closeModal() {
    if (isSaving) return
    resetModal()
  }

  function resetModal() {
    setEditingCommodityId(null)
    setCommodityForm(EMPTY_COMMODITY_FORM)
    setPendingDeleteId("")
  }

  async function handleSaveCommodityCode() {
    setIsSaving(true)
    try {
      const result = isExistingRecord
        ? await updateCommercialInvoiceCommodityCode(editingCommodityId ?? "", commodityForm)
        : await createCommercialInvoiceCommodityCode(commodityForm)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      if (result.commodityCodes) setCommodityCodes(result.commodityCodes)
      resetModal()
      toast.success(result.message)
    } catch {
      toast.error("Failed save commodity code.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteCommodityCode() {
    if (!editingCommodityId) return
    if (pendingDeleteId !== editingCommodityId) {
      setPendingDeleteId(editingCommodityId)
      toast.info("Press Confirm Delete Code to remove this commodity code.")
      return
    }

    setIsSaving(true)
    try {
      const result = await deleteCommercialInvoiceCommodityCode(editingCommodityId)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      if (result.commodityCodes) setCommodityCodes(result.commodityCodes)
      resetModal()
      toast.success(result.message)
    } catch {
      toast.error("Failed delete commodity code.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-brand-muted/80"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search commodity codes..."
            className="hub-input w-full rounded-lg py-2 pl-10 pr-4 text-sm outline-none"
          />
        </div>
        <button
          type="button"
          onClick={openNewCommodityCode}
          className="hub-button-primary rounded-xl px-4 py-2 text-sm font-semibold"
        >
          Add Commodity Code
        </button>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-brand-border/80 bg-brand-panel shadow-[0_0_15px_rgba(0,0,0,0.2)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="border-b border-brand-border bg-brand-panel-alt">
                {["Edit", "Label", "Product Type", "Material", "Commodity Code", "Description", "Notes"].map(
                  (heading) => (
                    <th key={heading} className="p-4 text-xs font-semibold uppercase tracking-wider text-brand-muted">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/70">
              {filteredCommodityCodes.length ? (
                filteredCommodityCodes.map((code) => (
                  <tr key={code.id} className="transition-colors hover:bg-brand-surface">
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => openEditCommodityCode(code)}
                        aria-label={`Edit ${getCommodityLabel(code)}`}
                        title="Edit commodity code"
                        className="rounded-lg border border-brand-border p-2 text-brand-muted/80 transition-colors hover:border-brand-red/50 hover:bg-brand-red/16 hover:text-brand-red/90"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.375 2.625a1 1 0 0 1 3 3L12 15l-4 1 1-4Z" />
                        </svg>
                      </button>
                    </td>
                    <td className="p-4 text-sm font-semibold text-brand-cream">{code.label}</td>
                    <td className="p-4 text-sm text-brand-cream/90">{code.productType}</td>
                    <td className="p-4 text-sm text-brand-muted">{preview(code.material)}</td>
                    <td className="p-4 font-mono text-sm text-brand-cream/90">{code.commodityCode}</td>
                    <td className="max-w-[260px] p-4 text-sm text-brand-muted">
                      <span className="block truncate">{preview(code.description)}</span>
                    </td>
                    <td className="max-w-[220px] p-4 text-sm text-brand-muted">
                      <span className="block truncate">{preview(code.notes)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-brand-muted/80">
                    No commodity codes found{search ? ` matching "${search}"` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl border border-brand-border bg-brand-panel shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-brand-border p-5">
              <div>
                <h2 className="text-xl font-bold text-brand-cream">
                  {isExistingRecord ? "Edit Commodity Code" : "Add Commodity Code"}
                </h2>
                <p className="mt-1 text-sm text-brand-muted">Product/material/type reference for invoice lines.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-brand-muted/80 transition-colors hover:text-brand-cream"
                aria-label="Close commodity code dialog"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
            <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-5">
              <div className="grid gap-3 md:grid-cols-2">
                {(["label", "productType", "material", "commodityCode"] as const).map((field) => (
                  <label key={field} className="grid gap-1.5 text-sm font-medium text-brand-muted">
                    {field === "productType" ? "Product Type" : field === "commodityCode" ? "Commodity Code" : field}
                    <input
                      value={commodityForm[field]}
                      onChange={(event) => setCommodityForm((current) => ({ ...current, [field]: event.target.value }))}
                      className="hub-input rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </label>
                ))}
                <label className="grid gap-1.5 text-sm font-medium text-brand-muted md:col-span-2">
                  Description
                  <textarea
                    value={commodityForm.description}
                    onChange={(event) => setCommodityForm((current) => ({ ...current, description: event.target.value }))}
                    rows={3}
                    className="hub-input resize-y rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-brand-muted md:col-span-2">
                  Notes
                  <textarea
                    value={commodityForm.notes}
                    onChange={(event) => setCommodityForm((current) => ({ ...current, notes: event.target.value }))}
                    rows={2}
                    className="hub-input resize-y rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap justify-between gap-3">
                {isExistingRecord ? (
                  <button
                    type="button"
                    onClick={handleDeleteCommodityCode}
                    disabled={isSaving}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-brand-red transition-colors hover:bg-brand-red/16 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pendingDeleteId === editingCommodityId ? "Confirm Delete Code" : "Delete Code"}
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSaving}
                    className="hub-button-secondary rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCommodityCode}
                    disabled={isSaving}
                    className="hub-button-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
