"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

type Currency = "GBP" | "EUR"
type DutiesPayableBy = "" | "Sender" | "Receiver"

type Address = {
  id: string
  label: string
  companyName: string
  contactName: string
  address: string
  country: string
  eori: string
  vat: string
  ein: string
  telephone: string
}

type InvoiceDetails = {
  reference: string
  date: string
  shipDate: string
  tracking: string
  boxCount: string
  weight: string
  currency: Currency
  dutiesPayableBy: DutiesPayableBy
}

type LineItem = {
  id: string
  product: string
  designName: string
  type: string
  description: string
  cost: string
  quantity: string
  commodityCode: string
  countryOfOrigin: string
}

const EMPTY_ADDRESS: Address = {
  id: "",
  label: "",
  companyName: "",
  contactName: "",
  address: "",
  country: "",
  eori: "",
  vat: "",
  ein: "",
  telephone: "",
}

const STARTER_ADDRESSES: Address[] = [
  {
    id: "epcc",
    label: "EPCC",
    companyName: "EPCC",
    contactName: "",
    address: "",
    country: "United Kingdom",
    eori: "",
    vat: "",
    ein: "",
    telephone: "",
  },
  {
    id: "sportimadok",
    label: "SPORTIMADOK",
    companyName: "SPORTIMADOK",
    contactName: "",
    address: "",
    country: "Hungary",
    eori: "",
    vat: "",
    ein: "",
    telephone: "",
  },
  {
    id: "aaa-vans-ireland",
    label: "AAA Vans Ireland",
    companyName: "AAA Vans Ireland",
    contactName: "",
    address: "",
    country: "Ireland",
    eori: "",
    vat: "",
    ein: "",
    telephone: "",
  },
]

const today = new Date().toISOString().slice(0, 10)

const INITIAL_DETAILS: InvoiceDetails = {
  reference: "",
  date: today,
  shipDate: today,
  tracking: "",
  boxCount: "",
  weight: "",
  currency: "GBP",
  dutiesPayableBy: "",
}

function getId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()}`
}

function createLineItem(): LineItem {
  return {
    id: getId(),
    product: "",
    designName: "",
    type: "",
    description: "",
    cost: "",
    quantity: "",
    commodityCode: "",
    countryOfOrigin: "",
  }
}

function getLineTotal(item: LineItem) {
  const cost = Number.parseFloat(item.cost) || 0
  const quantity = Number.parseFloat(item.quantity) || 0

  return cost * quantity
}

function getQuantity(item: LineItem) {
  return Number.parseFloat(item.quantity) || 0
}

function hasLineItemContent(item: LineItem) {
  return [
    item.product,
    item.designName,
    item.type,
    item.description,
    item.cost,
    item.quantity,
    item.commodityCode,
    item.countryOfOrigin,
  ].some((value) => value.trim())
}

function formatMoney(value: number, currency: Currency) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function fieldId(prefix: string, field: keyof Address) {
  return `${prefix}-${field}`
}

function validateInvoice(details: InvoiceDetails, sender: Address, receiver: Address, lineItems: LineItem[]) {
  const errors: string[] = []

  if (!details.reference.trim()) errors.push("Invoice No / Reference is required.")
  if (!details.dutiesPayableBy) errors.push("Duties Payable By must be selected.")
  if (!sender.companyName.trim() || !sender.address.trim()) errors.push("Sender company name and address are required.")
  if (!receiver.companyName.trim() || !receiver.address.trim()) errors.push("Receiver company name and address are required.")
  if (!lineItems.some(hasLineItemContent)) errors.push("At least one line item is required.")

  return errors
}

function AddressSection({
  title,
  address,
  selectedAddressId,
  onSelectAddress,
  onChangeAddress,
}: {
  title: string
  address: Address
  selectedAddressId: string
  onSelectAddress: (addressId: string) => void
  onChangeAddress: (field: keyof Address, value: string) => void
}) {
  const prefix = title.toLowerCase()

  return (
    <section className="hub-panel grid gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-cream">{title}</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Select a saved address or enter the {title.toLowerCase()} details manually.
          </p>
        </div>
        <label className="grid min-w-[220px] gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
          Saved Address
          <select
            value={selectedAddressId}
            onChange={(event) => onSelectAddress(event.target.value)}
            className="hub-input rounded-xl px-3 py-2 text-sm normal-case tracking-normal outline-none"
          >
            <option value="">Manual / unselected</option>
            {STARTER_ADDRESSES.map((savedAddress) => (
              <option key={savedAddress.id} value={savedAddress.id}>
                {savedAddress.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "companyName")}>
          Company Name
          <input
            id={fieldId(prefix, "companyName")}
            value={address.companyName}
            onChange={(event) => onChangeAddress("companyName", event.target.value)}
            className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "contactName")}>
          Contact Name
          <input
            id={fieldId(prefix, "contactName")}
            value={address.contactName}
            onChange={(event) => onChangeAddress("contactName", event.target.value)}
            className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "country")}>
          Country
          <input
            id={fieldId(prefix, "country")}
            value={address.country}
            onChange={(event) => onChangeAddress("country", event.target.value)}
            className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "telephone")}>
          Telephone
          <input
            id={fieldId(prefix, "telephone")}
            value={address.telephone}
            onChange={(event) => onChangeAddress("telephone", event.target.value)}
            className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-brand-cream md:col-span-2" htmlFor={fieldId(prefix, "address")}>
          Address
          <textarea
            id={fieldId(prefix, "address")}
            value={address.address}
            onChange={(event) => onChangeAddress("address", event.target.value)}
            rows={3}
            className="hub-input rounded-xl px-3 py-2 text-sm leading-5 outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "eori")}>
          EORI
          <input
            id={fieldId(prefix, "eori")}
            value={address.eori}
            onChange={(event) => onChangeAddress("eori", event.target.value)}
            className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "vat")}>
          VAT
          <input
            id={fieldId(prefix, "vat")}
            value={address.vat}
            onChange={(event) => onChangeAddress("vat", event.target.value)}
            className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "ein")}>
          EIN
          <input
            id={fieldId(prefix, "ein")}
            value={address.ein}
            onChange={(event) => onChangeAddress("ein", event.target.value)}
            className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>
      </div>
    </section>
  )
}

export default function CommercialInvoiceClient() {
  const [details, setDetails] = useState<InvoiceDetails>(INITIAL_DETAILS)
  const [senderAddressId, setSenderAddressId] = useState("")
  const [receiverAddressId, setReceiverAddressId] = useState("")
  const [sender, setSender] = useState<Address>(EMPTY_ADDRESS)
  const [receiver, setReceiver] = useState<Address>(EMPTY_ADDRESS)
  const [lineItems, setLineItems] = useState<LineItem[]>([createLineItem()])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const summary = useMemo(() => {
    return lineItems.reduce(
      (current, item) => ({
        quantity: current.quantity + getQuantity(item),
        total: current.total + getLineTotal(item),
      }),
      { quantity: 0, total: 0 },
    )
  }, [lineItems])

  function updateDetails<Field extends keyof InvoiceDetails>(field: Field, value: InvoiceDetails[Field]) {
    setDetails((current) => ({ ...current, [field]: value }))
  }

  function selectAddress(addressId: string, target: "sender" | "receiver") {
    const selectedAddress = STARTER_ADDRESSES.find((address) => address.id === addressId)

    if (target === "sender") {
      setSenderAddressId(addressId)
      if (selectedAddress) setSender(selectedAddress)
      return
    }

    setReceiverAddressId(addressId)
    if (selectedAddress) setReceiver(selectedAddress)
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string) {
    setLineItems((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  function removeLineItem(id: string) {
    setLineItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current))
  }

  function handleExport() {
    const errors = validateInvoice(details, sender, receiver, lineItems)
    setValidationErrors(errors)

    if (errors.length) {
      toast.error("Complete required invoice fields before export.")
      return
    }

    toast.info("Excel export will be added next.")
  }

  function handleSavePlaceholder() {
    toast.info("Invoice saving/loading is planned for a later database-backed stage.")
  }

  return (
    <div className="grid gap-4">
      <section className="hub-panel grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-cream">Invoice Details</h2>
            <p className="mt-1 text-sm text-brand-muted">Duties payer must be selected for every invoice.</p>
          </div>
          <span className="rounded-full border border-brand-border bg-brand-panel-alt/70 px-3 py-1 text-xs font-medium text-brand-muted">
            Manual V1
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-reference">
            Invoice No / Reference
            <input
              id="invoice-reference"
              value={details.reference}
              onChange={(event) => updateDetails("reference", event.target.value)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-date">
            Date
            <input
              id="invoice-date"
              type="date"
              value={details.date}
              onChange={(event) => updateDetails("date", event.target.value)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-ship-date">
            Ship Date
            <input
              id="invoice-ship-date"
              type="date"
              value={details.shipDate}
              onChange={(event) => updateDetails("shipDate", event.target.value)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-tracking">
            Tracking
            <input
              id="invoice-tracking"
              value={details.tracking}
              onChange={(event) => updateDetails("tracking", event.target.value)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-box-count">
            Box Count
            <input
              id="invoice-box-count"
              inputMode="numeric"
              value={details.boxCount}
              onChange={(event) => updateDetails("boxCount", event.target.value)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-weight">
            Weight
            <input
              id="invoice-weight"
              value={details.weight}
              onChange={(event) => updateDetails("weight", event.target.value)}
              placeholder="Example: 18 kg"
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-currency">
            Currency
            <select
              id="invoice-currency"
              value={details.currency}
              onChange={(event) => updateDetails("currency", event.target.value as Currency)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-duties">
            Duties Payable By
            <select
              id="invoice-duties"
              value={details.dutiesPayableBy}
              onChange={(event) => updateDetails("dutiesPayableBy", event.target.value as DutiesPayableBy)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="">Select payer</option>
              <option value="Sender">Sender</option>
              <option value="Receiver">Receiver</option>
            </select>
            {!details.dutiesPayableBy ? (
              <span className="text-xs font-medium text-brand-red/90">Required. Do not leave duties payer unselected.</span>
            ) : null}
          </label>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <AddressSection
          title="Sender"
          address={sender}
          selectedAddressId={senderAddressId}
          onSelectAddress={(addressId) => selectAddress(addressId, "sender")}
          onChangeAddress={(field, value) => setSender((current) => ({ ...current, [field]: value }))}
        />
        <AddressSection
          title="Receiver"
          address={receiver}
          selectedAddressId={receiverAddressId}
          onSelectAddress={(addressId) => selectAddress(addressId, "receiver")}
          onChangeAddress={(field, value) => setReceiver((current) => ({ ...current, [field]: value }))}
        />
      </div>

      <section className="hub-panel grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-cream">Line Items</h2>
            <p className="mt-1 max-w-4xl text-sm text-brand-muted">
              Commodity code follows the product, material, and type. Country of origin follows the actual garment or product
              and where it was made. Keep both editable because they may come from different sources.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLineItems((current) => [...current, createLineItem()])}
            className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold"
          >
            Add Line
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-brand-border">
          <table className="min-w-[1280px] w-full border-collapse text-left text-sm">
            <thead className="bg-brand-panel-alt/80 text-xs uppercase tracking-[0.12em] text-brand-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Product</th>
                <th className="px-3 py-2 font-semibold">Design Name</th>
                <th className="px-3 py-2 font-semibold">Type / Material</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 font-semibold">Cost</th>
                <th className="px-3 py-2 font-semibold">Qty</th>
                <th className="px-3 py-2 font-semibold">Total</th>
                <th className="px-3 py-2 font-semibold">Commodity Code (Product/Material/Type)</th>
                <th className="px-3 py-2 font-semibold">Country of Origin (Actual Garment)</th>
                <th className="px-3 py-2 font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id} className="border-t border-brand-border/70 align-top">
                  <td className="min-w-[150px] px-2 py-2">
                    <input
                      value={item.product}
                      onChange={(event) => updateLineItem(item.id, "product", event.target.value)}
                      placeholder="Example: T-shirt"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[150px] px-2 py-2">
                    <input
                      value={item.designName}
                      onChange={(event) => updateLineItem(item.id, "designName", event.target.value)}
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[140px] px-2 py-2">
                    <input
                      value={item.type}
                      onChange={(event) => updateLineItem(item.id, "type", event.target.value)}
                      placeholder="100% cotton"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[220px] px-2 py-2">
                    <input
                      value={item.description}
                      onChange={(event) => updateLineItem(item.id, "description", event.target.value)}
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[110px] px-2 py-2">
                    <input
                      value={item.cost}
                      onChange={(event) => updateLineItem(item.id, "cost", event.target.value)}
                      inputMode="decimal"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[90px] px-2 py-2">
                    <input
                      value={item.quantity}
                      onChange={(event) => updateLineItem(item.id, "quantity", event.target.value)}
                      inputMode="decimal"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[120px] px-2 py-2">
                    <input
                      value={formatMoney(getLineTotal(item), details.currency)}
                      readOnly
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[210px] px-2 py-2">
                    <input
                      value={item.commodityCode}
                      onChange={(event) => updateLineItem(item.id, "commodityCode", event.target.value)}
                      placeholder="Example: 6109100010"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                    <p className="mt-1 text-[11px] leading-4 text-brand-muted">Based on product/material/type, not brand.</p>
                  </td>
                  <td className="min-w-[210px] px-2 py-2">
                    <input
                      value={item.countryOfOrigin}
                      onChange={(event) => updateLineItem(item.id, "countryOfOrigin", event.target.value)}
                      placeholder="Actual garment origin"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                    <p className="mt-1 text-[11px] leading-4 text-brand-muted">Based on where this product was made.</p>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="hub-button-secondary rounded-full px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hub-panel grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-cream">Saved Invoices</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Planned: save invoice drafts and load previous invoices for reuse. Database-backed saving is not active in V1.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSavePlaceholder}
              className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
            >
              Save Draft Later
            </button>
            <button
              type="button"
              onClick={handleSavePlaceholder}
              className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
            >
              Load Saved Later
            </button>
          </div>
        </div>
      </section>

      <section className="hub-panel grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-brand-cream">Summary / Export</h2>
          <button type="button" onClick={handleExport} className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold">
            Export Excel
          </button>
        </div>

        {validationErrors.length ? (
          <div className="rounded-2xl border border-brand-red/45 bg-brand-red/10 px-4 py-3 text-sm text-brand-cream">
            <p className="font-semibold">Export blocked until required fields are complete:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-brand-muted">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-border bg-brand-panel-alt/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Total Quantity</p>
            <p className="mt-1 text-2xl font-semibold text-brand-cream">{summary.quantity.toLocaleString("en-GB")}</p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-panel-alt/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Invoice Total</p>
            <p className="mt-1 text-2xl font-semibold text-brand-cream">{formatMoney(summary.total, details.currency)}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
