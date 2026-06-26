"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  createSavedInvoiceAddress,
  deleteSavedInvoiceAddress,
  updateSavedInvoiceAddress,
} from "../../commercial-invoices/actions"
import type { SavedInvoiceAddressPayload, SavedInvoiceAddressRecord } from "../../commercial-invoices/types"

const EMPTY_ADDRESS_FORM: SavedInvoiceAddressPayload = {
  label: "",
  companyName: "",
  contactName: "",
  address: "",
  country: "",
  eori: "",
  vat: "",
  ein: "",
  telephone: "",
  email: "",
  notes: "",
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function addressToForm(address?: SavedInvoiceAddressRecord): SavedInvoiceAddressPayload {
  return address
    ? {
        label: address.label,
        companyName: address.companyName,
        contactName: address.contactName,
        address: address.address,
        country: address.country,
        eori: address.eori,
        vat: address.vat,
        ein: address.ein,
        telephone: address.telephone,
        email: address.email,
        notes: address.notes,
      }
    : EMPTY_ADDRESS_FORM
}

function getAddressSearchText(address: SavedInvoiceAddressRecord) {
  return normalizeSearch(
    [
      address.label,
      address.companyName,
      address.contactName,
      address.country,
      address.eori,
      address.vat,
      address.ein,
      address.telephone,
      address.email,
      address.address,
      address.notes,
    ].join(" "),
  )
}

function preview(value: string) {
  return value.trim() || "-"
}

export default function AddressReferenceClient({ initialAddresses }: { initialAddresses: SavedInvoiceAddressRecord[] }) {
  const [addresses, setAddresses] = useState(initialAddresses)
  const [search, setSearch] = useState("")
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState<SavedInvoiceAddressPayload>(EMPTY_ADDRESS_FORM)
  const [pendingDeleteId, setPendingDeleteId] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const isModalOpen = editingAddressId !== null
  const isExistingRecord = Boolean(editingAddressId)

  const filteredAddresses = useMemo(() => {
    const queryParts = normalizeSearch(search).split(" ").filter(Boolean)
    if (!queryParts.length) return addresses
    return addresses.filter((address) => {
      const searchable = getAddressSearchText(address)
      return queryParts.every((part) => searchable.includes(part))
    })
  }, [addresses, search])

  function openNewAddress() {
    setEditingAddressId("")
    setAddressForm(EMPTY_ADDRESS_FORM)
    setPendingDeleteId("")
  }

  function openEditAddress(address: SavedInvoiceAddressRecord) {
    setEditingAddressId(address.id)
    setAddressForm(addressToForm(address))
    setPendingDeleteId("")
  }

  function closeModal() {
    if (isSaving) return
    resetModal()
  }

  function resetModal() {
    setEditingAddressId(null)
    setAddressForm(EMPTY_ADDRESS_FORM)
    setPendingDeleteId("")
  }

  async function handleSaveAddress() {
    setIsSaving(true)
    try {
      const result = isExistingRecord
        ? await updateSavedInvoiceAddress(editingAddressId ?? "", addressForm)
        : await createSavedInvoiceAddress(addressForm)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      if (result.addresses) setAddresses(result.addresses)
      resetModal()
      toast.success(result.message)
    } catch {
      toast.error("Failed save address.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteAddress() {
    if (!editingAddressId) return
    if (pendingDeleteId !== editingAddressId) {
      setPendingDeleteId(editingAddressId)
      toast.info("Press Confirm Delete Address to remove this saved address.")
      return
    }

    setIsSaving(true)
    try {
      const result = await deleteSavedInvoiceAddress(editingAddressId)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      if (result.addresses) setAddresses(result.addresses)
      resetModal()
      toast.success(result.message)
    } catch {
      toast.error("Failed delete address.")
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
            placeholder="Search addresses..."
            className="hub-input w-full rounded-lg py-2 pl-10 pr-4 text-sm outline-none"
          />
        </div>
        <button type="button" onClick={openNewAddress} className="hub-button-primary rounded-xl px-4 py-2 text-sm font-semibold">
          Add Address
        </button>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-brand-border/80 bg-brand-panel shadow-[0_0_15px_rgba(0,0,0,0.2)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead>
              <tr className="border-b border-brand-border bg-brand-panel-alt">
                {["Edit", "Label", "Company Name", "Country", "EORI", "VAT", "EIN", "Telephone", "Email", "Address / Notes"].map(
                  (heading) => (
                    <th key={heading} className="p-4 text-xs font-semibold uppercase tracking-wider text-brand-muted">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/70">
              {filteredAddresses.length ? (
                filteredAddresses.map((address) => (
                  <tr key={address.id} className="transition-colors hover:bg-brand-surface">
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => openEditAddress(address)}
                        aria-label={`Edit ${address.label}`}
                        title="Edit address"
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
                    <td className="p-4 text-sm font-semibold text-brand-cream">{address.label}</td>
                    <td className="p-4 text-sm text-brand-cream/90">{address.companyName}</td>
                    <td className="p-4 text-sm text-brand-muted">{preview(address.country)}</td>
                    <td className="p-4 font-mono text-sm text-brand-muted">{preview(address.eori)}</td>
                    <td className="p-4 font-mono text-sm text-brand-muted">{preview(address.vat)}</td>
                    <td className="p-4 font-mono text-sm text-brand-muted">{preview(address.ein)}</td>
                    <td className="p-4 text-sm text-brand-muted">{preview(address.telephone)}</td>
                    <td className="p-4 text-sm text-brand-muted">{preview(address.email)}</td>
                    <td className="max-w-[260px] p-4 text-sm text-brand-muted">
                      <span className="block truncate">{preview(address.notes || address.address)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-brand-muted/80">
                    No saved addresses found{search ? ` matching "${search}"` : ""}.
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
            className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-brand-border bg-brand-panel shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-brand-border p-5">
              <div>
                <h2 className="text-xl font-bold text-brand-cream">
                  {isExistingRecord ? "Edit Address" : "Add Address"}
                </h2>
                <p className="mt-1 text-sm text-brand-muted">Reusable invoice sender or receiver details.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-brand-muted/80 transition-colors hover:text-brand-cream"
                aria-label="Close address dialog"
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
                {(
                  ["label", "companyName", "contactName", "country", "telephone", "email", "eori", "vat", "ein"] as const
                ).map((field) => (
                  <label key={field} className="grid gap-1.5 text-sm font-medium text-brand-muted">
                    {field === "companyName" ? "Company Name" : field.toUpperCase()}
                    <input
                      value={addressForm[field]}
                      onChange={(event) => setAddressForm((current) => ({ ...current, [field]: event.target.value }))}
                      className="hub-input rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </label>
                ))}
                <label className="grid gap-1.5 text-sm font-medium text-brand-muted md:col-span-2">
                  Address
                  <textarea
                    value={addressForm.address}
                    onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))}
                    rows={4}
                    className="hub-input resize-y rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-brand-muted md:col-span-2">
                  Notes
                  <textarea
                    value={addressForm.notes}
                    onChange={(event) => setAddressForm((current) => ({ ...current, notes: event.target.value }))}
                    rows={2}
                    className="hub-input resize-y rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap justify-between gap-3">
                {isExistingRecord ? (
                  <button
                    type="button"
                    onClick={handleDeleteAddress}
                    disabled={isSaving}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-brand-red transition-colors hover:bg-brand-red/16 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pendingDeleteId === editingAddressId ? "Confirm Delete Address" : "Delete Address"}
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
                    onClick={handleSaveAddress}
                    disabled={isSaving}
                    className="hub-button-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save Address
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
