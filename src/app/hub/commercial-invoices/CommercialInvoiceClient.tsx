"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  deleteCommercialInvoice,
  getCommercialInvoice,
  saveCommercialInvoice,
  updateCommercialInvoice,
} from "./actions"
import type {
  CommercialInvoiceAddressSnapshot,
  CommercialInvoiceCommodityCodeRecord,
  CommercialInvoiceLinePayload,
  CommercialInvoicePayload,
  CommercialInvoicesData,
  SavedCommercialInvoiceRecord,
  SavedCommercialInvoiceSummary,
  SavedInvoiceAddressRecord,
} from "./types"

type Currency = "GBP" | "EUR"
type DutiesPayableBy = "" | "Sender" | "Receiver"
type PrintLocation = "" | "United Kingdom" | "Hungary"
type CountryOfOriginMode = "FIXED" | "VARIABLE" | "UNKNOWN"
type CountryOfOriginMetadata = {
  mode: CountryOfOriginMode
  match?: RegExp
  fixedCountry?: string
  options?: string[]
}
type Address = CommercialInvoiceAddressSnapshot
type InvoiceDetails = CommercialInvoicePayload["details"]
type LineItem = CommercialInvoiceLinePayload

type ExportLineItem = LineItem & {
  costValue: number
  quantityValue: number
  totalValue: number
}

type ExportData = {
  details: InvoiceDetails & { printLocation: "United Kingdom" | "Hungary"; dutiesPayableBy: "Sender" | "Receiver" }
  sender: Address
  receiver: Address
  lineItems: ExportLineItem[]
  summary: {
    quantity: number
    total: number
  }
}

const today = new Date().toISOString().slice(0, 10)

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
  email: "",
  notes: "",
}

const STARTER_SAVED_ADDRESSES: SavedInvoiceAddressRecord[] = [
  {
    id: "starter-epcc",
    label: "EPCC",
    companyName: "The Embroidered & Printed Clothing Company",
    contactName: "",
    address: "Premier House, 82 Sweyn Road\nMargate\nKent\nCT9 2DD\nUNITED KINGDOM",
    country: "United Kingdom",
    eori: "GB995260876000",
    vat: "",
    ein: "",
    telephone: "",
    email: "",
    notes: "",
    updatedAt: "",
  },
  {
    id: "starter-sportimadok",
    label: "Sportimadok",
    companyName: "Sportimadok.hu kft",
    contactName: "",
    address: "Hungary, Budapest, Sasadi ut 145\nPost Code: 1112",
    country: "Hungary",
    eori: "HU0044897613",
    vat: "HU25464807",
    ein: "",
    telephone: "",
    email: "",
    notes: "",
    updatedAt: "",
  },
  {
    id: "starter-aaa-vans-ireland",
    label: "AAA Vans Ireland",
    companyName: "AAA Vans Ireland",
    contactName: "",
    address: "Unit R - Jordanstown Road\nAerodrome Business Park\nRathcoole, Co. Dublin\nD24 Y6TX, EIRE",
    country: "Ireland",
    eori: "04397934NH",
    vat: "FR19999447618",
    ein: "",
    telephone: "",
    email: "",
    notes: "",
    updatedAt: "",
  },
]

const INITIAL_DETAILS: InvoiceDetails = {
  reference: "",
  date: today,
  shipDate: today,
  tracking: "",
  boxCount: "",
  weight: "",
  currency: "GBP",
  printLocation: "",
  dutiesPayableBy: "",
}

const LINE_ITEM_HEADERS = [
  "Product",
  "Design Name",
  "Type",
  "Description",
  "Cost",
  "Qty",
  "Total",
  "Commodity Code",
  "Country of Origin",
]

const MANUAL_COUNTRY_OF_ORIGIN = "__manual"

const UNKNOWN_COUNTRY_OF_ORIGIN_METADATA: CountryOfOriginMetadata = { mode: "UNKNOWN" }

const COUNTRY_OF_ORIGIN_METADATA: CountryOfOriginMetadata[] = [
  {
    mode: "FIXED",
    match: /\b(?:westford\s+mill\s+)?w101\b/i,
    fixedCountry: "China",
  },
  {
    mode: "VARIABLE",
    match: /\bgildan\b/i,
    options: ["Bangladesh", "Honduras", "Nicaragua", "Haiti"],
  },
]

function getId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return `${Date.now()}-${Math.random()}`
}

function normalizeAddress(address?: Partial<Address>): Address {
  return {
    id: address?.id ?? "",
    label: address?.label ?? "",
    companyName: address?.companyName ?? "",
    contactName: address?.contactName ?? "",
    address: address?.address ?? "",
    country: address?.country ?? "",
    eori: address?.eori ?? "",
    vat: address?.vat ?? "",
    ein: address?.ein ?? "",
    telephone: address?.telephone ?? "",
    email: address?.email ?? "",
    notes: address?.notes ?? "",
  }
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

function getCost(item: LineItem) {
  return Number.parseFloat(item.cost) || 0
}

function getQuantity(item: LineItem) {
  return Number.parseFloat(item.quantity) || 0
}

function getLineTotal(item: LineItem) {
  return getCost(item) * getQuantity(item)
}

function getCountryOfOriginMetadata(item: LineItem) {
  const productText = [item.product, item.type, item.description].join(" ")
  const matched = COUNTRY_OF_ORIGIN_METADATA.find((metadata) => metadata.match?.test(productText))
  return matched ?? UNKNOWN_COUNTRY_OF_ORIGIN_METADATA
}

function getCountryOfOriginSelectValue(item: LineItem) {
  const metadata = getCountryOfOriginMetadata(item)
  if (metadata.mode !== "VARIABLE") return item.countryOfOrigin
  if (!item.countryOfOrigin.trim()) return ""
  return metadata.options?.includes(item.countryOfOrigin) ? item.countryOfOrigin : MANUAL_COUNTRY_OF_ORIGIN
}

function hasManualCountryOfOrigin(item: LineItem) {
  return getCountryOfOriginSelectValue(item) === MANUAL_COUNTRY_OF_ORIGIN
}

function needsVariableCountryOfOrigin(item: LineItem) {
  const metadata = getCountryOfOriginMetadata(item)
  return metadata.mode === "VARIABLE" && !item.countryOfOrigin.trim()
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

function hasValidLineItem(item: LineItem) {
  const cost = Number.parseFloat(item.cost)
  const quantity = Number.parseFloat(item.quantity)
  return Boolean(item.product.trim()) && Number.isFinite(cost) && Number.isInteger(quantity) && quantity > 0
}

function validateInvoice(details: InvoiceDetails, sender: Address, receiver: Address, lineItems: LineItem[]) {
  const errors: string[] = []
  const contentLines = lineItems.filter(hasLineItemContent)

  if (!details.reference.trim()) errors.push("Invoice No / Reference is required.")
  if (!details.printLocation) errors.push("Print Location is required.")
  if (!details.dutiesPayableBy) errors.push("Duties Payable By must be selected.")
  if (!sender.companyName.trim() || !sender.address.trim()) errors.push("Sender company name and address are required.")
  if (!receiver.companyName.trim() || !receiver.address.trim()) errors.push("Receiver company name and address are required.")
  if (!contentLines.length) errors.push("At least one line item is required.")
  else if (contentLines.some((item) => !hasValidLineItem(item))) {
    errors.push("Every line item needs product, cost, and whole-number quantity.")
  }
  if (contentLines.some(needsVariableCountryOfOrigin)) {
    errors.push("Variable-origin products need a selected or manual Country of Origin.")
  }

  return errors
}

function formatMoney(value: number, currency: Currency) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function getCurrencyFormat(currency: Currency) {
  return currency === "GBP" ? "£#,##0.00" : "€#,##0.00"
}

function fieldId(prefix: string, field: keyof Address) {
  return `${prefix}-${field}`
}

function sanitizeFilenamePart(value: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return cleaned || today
}

function getBaseFilename(details: InvoiceDetails) {
  return `commercial-invoice-${sanitizeFilenamePart(details.reference || details.date)}`
}

function getAddressRows(address: Address) {
  return [
    ["Company", address.companyName],
    ["Contact", address.contactName],
    ["Address", address.address],
    ["Country", address.country],
    ["EORI", address.eori],
    ["VAT", address.vat],
    ["EIN", address.ein],
    ["Telephone", address.telephone],
    ["Email", address.email],
    ["Notes", address.notes],
  ]
}

function getAddressBlock(address: Address) {
  return getAddressRows(address)
    .filter(([, value]) => value.trim())
    .map(([label, value]) => `${label}: ${value}`)
}

function getSavedInvoiceLabel(invoice: SavedCommercialInvoiceSummary) {
  const base = invoice.title || invoice.invoiceNumber || invoice.reference || "Untitled invoice"
  const date = invoice.invoiceDate ? ` · ${invoice.invoiceDate}` : ""
  return `${base}${date}`
}

function getCommodityLabel(item: CommercialInvoiceCommodityCodeRecord) {
  const material = item.material ? ` · ${item.material}` : ""
  return `${item.label} · ${item.commodityCode}${material}`
}

function getExportData(
  details: InvoiceDetails,
  sender: Address,
  receiver: Address,
  lineItems: LineItem[],
  summary: ExportData["summary"],
): ExportData | null {
  if (!details.printLocation || !details.dutiesPayableBy) return null

  return {
    details: { ...details, printLocation: details.printLocation, dutiesPayableBy: details.dutiesPayableBy },
    sender,
    receiver,
    summary,
    lineItems: lineItems.filter(hasLineItemContent).map((item) => ({
      ...item,
      costValue: getCost(item),
      quantityValue: getQuantity(item),
      totalValue: getLineTotal(item),
    })),
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function AddressSection({
  title,
  address,
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onChangeAddress,
}: {
  title: string
  address: Address
  savedAddresses: SavedInvoiceAddressRecord[]
  selectedAddressId: string
  onSelectAddress: (addressId: string) => void
  onChangeAddress: (field: keyof Address, value: string) => void
}) {
  const prefix = title.toLowerCase()

  return (
    <section className="hub-panel grid min-w-0 gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-brand-cream">{title}</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Select a saved address or enter the {title.toLowerCase()} details manually.
          </p>
          <Link href="/hub/data/addresses" className="mt-2 inline-flex text-xs font-semibold text-brand-red hover:text-brand-cream">
            Manage Saved Addresses
          </Link>
        </div>
        <label className="grid w-full min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted sm:max-w-xs sm:flex-1">
          Saved Address
          <select
            value={selectedAddressId}
            onChange={(event) => onSelectAddress(event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm normal-case tracking-normal outline-none"
          >
            <option value="">Manual / unselected</option>
            {savedAddresses.map((savedAddress) => (
              <option key={savedAddress.id} value={savedAddress.id}>
                {savedAddress.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "companyName")}>
          Company Name
          <input
            id={fieldId(prefix, "companyName")}
            value={address.companyName}
            onChange={(event) => onChangeAddress("companyName", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "contactName")}>
          Contact Name
          <input
            id={fieldId(prefix, "contactName")}
            value={address.contactName}
            onChange={(event) => onChangeAddress("contactName", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "country")}>
          Country
          <input
            id={fieldId(prefix, "country")}
            value={address.country}
            onChange={(event) => onChangeAddress("country", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "telephone")}>
          Telephone
          <input
            id={fieldId(prefix, "telephone")}
            value={address.telephone}
            onChange={(event) => onChangeAddress("telephone", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream sm:col-span-2" htmlFor={fieldId(prefix, "address")}>
          Address
          <textarea
            id={fieldId(prefix, "address")}
            value={address.address}
            onChange={(event) => onChangeAddress("address", event.target.value)}
            rows={3}
            className="hub-input w-full min-w-0 resize-y rounded-xl px-3 py-2 text-sm leading-5 outline-none"
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "eori")}>
          EORI
          <input
            id={fieldId(prefix, "eori")}
            value={address.eori}
            onChange={(event) => onChangeAddress("eori", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "vat")}>
          VAT
          <input
            id={fieldId(prefix, "vat")}
            value={address.vat}
            onChange={(event) => onChangeAddress("vat", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "ein")}>
          EIN
          <input
            id={fieldId(prefix, "ein")}
            value={address.ein}
            onChange={(event) => onChangeAddress("ein", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "email")}>
          Email
          <input
            id={fieldId(prefix, "email")}
            value={address.email}
            onChange={(event) => onChangeAddress("email", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream sm:col-span-2" htmlFor={fieldId(prefix, "notes")}>
          Notes
          <textarea
            id={fieldId(prefix, "notes")}
            value={address.notes}
            onChange={(event) => onChangeAddress("notes", event.target.value)}
            rows={2}
            className="hub-input w-full min-w-0 resize-y rounded-xl px-3 py-2 text-sm leading-5 outline-none"
          />
        </label>
      </div>
    </section>
  )
}

export default function CommercialInvoiceClient({ initialData }: { initialData: CommercialInvoicesData }) {
  const [details, setDetails] = useState<InvoiceDetails>(INITIAL_DETAILS)
  const [senderAddressId, setSenderAddressId] = useState("")
  const [receiverAddressId, setReceiverAddressId] = useState("")
  const [sender, setSender] = useState<Address>(EMPTY_ADDRESS)
  const [receiver, setReceiver] = useState<Address>(EMPTY_ADDRESS)
  const [lineItems, setLineItems] = useState<LineItem[]>([createLineItem()])
  const [manualCountryOfOriginLines, setManualCountryOfOriginLines] = useState<Record<string, boolean>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [savedInvoices, setSavedInvoices] = useState<SavedCommercialInvoiceSummary[]>(initialData.invoices)
  const savedAddresses = initialData.addresses
  const commodityCodes = initialData.commodityCodes
  const [selectedSavedInvoiceId, setSelectedSavedInvoiceId] = useState("")
  const [currentInvoiceId, setCurrentInvoiceId] = useState("")
  const [pendingDeleteId, setPendingDeleteId] = useState("")
  const [isPersisting, setIsPersisting] = useState(false)
  const savedAddressOptions = savedAddresses.length ? savedAddresses : STARTER_SAVED_ADDRESSES

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

  function getInvoicePayload(): CommercialInvoicePayload {
    return { details, sender, receiver, lineItems }
  }

  function validateForSave() {
    const errors = validateInvoice(details, sender, receiver, lineItems)
    setValidationErrors(errors)
    if (errors.length) {
      toast.error("Complete required invoice fields before saving.")
      return false
    }
    return true
  }

  function getValidatedExportData() {
    const errors = validateInvoice(details, sender, receiver, lineItems)
    setValidationErrors(errors)
    if (errors.length) {
      toast.error("Complete required invoice fields before export.")
      return null
    }
    return getExportData(details, sender, receiver, lineItems, summary)
  }

  function applySavedInvoice(invoice: SavedCommercialInvoiceRecord) {
    setDetails(invoice.details)
    setSender(normalizeAddress(invoice.sender))
    setReceiver(normalizeAddress(invoice.receiver))
    setSenderAddressId("")
    setReceiverAddressId("")
    setLineItems(invoice.lineItems.length ? invoice.lineItems : [createLineItem()])
    setManualCountryOfOriginLines(
      Object.fromEntries(invoice.lineItems.filter(hasManualCountryOfOrigin).map((item) => [item.id, true])),
    )
    setCurrentInvoiceId(invoice.id)
    setSelectedSavedInvoiceId(invoice.id)
    setPendingDeleteId("")
    setValidationErrors([])
  }

  function selectAddress(addressId: string, target: "sender" | "receiver") {
    const selectedAddress = normalizeAddress(savedAddressOptions.find((address) => address.id === addressId))
    if (target === "sender") {
      setSenderAddressId(addressId)
      setSender(selectedAddress)
      return
    }
    setReceiverAddressId(addressId)
    setReceiver(selectedAddress)
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string) {
    setLineItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        const nextItem = { ...item, [field]: value }
        if (field !== "product" && field !== "type" && field !== "description") return nextItem

        const metadata = getCountryOfOriginMetadata(nextItem)
        if (metadata.mode === "FIXED" && metadata.fixedCountry && !nextItem.countryOfOrigin.trim()) {
          return { ...nextItem, countryOfOrigin: metadata.fixedCountry }
        }

        return nextItem
      }),
    )
  }

  function applyCommodityReference(lineItemId: string, commodityId: string) {
    const commodity = commodityCodes.find((item) => item.id === commodityId)
    if (!commodity) return

    setLineItems((current) =>
      current.map((item) =>
        item.id === lineItemId
          ? {
              ...item,
              type: item.type.trim() ? item.type : [commodity.productType, commodity.material].filter(Boolean).join(" / "),
              description: item.description.trim() ? item.description : commodity.description,
              commodityCode: commodity.commodityCode,
            }
          : item,
      ),
    )
  }

  function removeLineItem(id: string) {
    setLineItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current))
    setManualCountryOfOriginLines((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  async function handleSaveInvoice() {
    if (!validateForSave()) return
    setIsPersisting(true)
    try {
      const result = currentInvoiceId
        ? await updateCommercialInvoice(currentInvoiceId, getInvoicePayload())
        : await saveCommercialInvoice(getInvoicePayload())
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      if (result.invoices) setSavedInvoices(result.invoices)
      if (result.invoice) {
        setCurrentInvoiceId(result.invoice.id)
        setSelectedSavedInvoiceId(result.invoice.id)
      }
      toast.success(result.message)
    } catch {
      toast.error("Failed to save commercial invoice.")
    } finally {
      setIsPersisting(false)
    }
  }

  async function handleSaveAsNewInvoice() {
    if (!validateForSave()) return
    setIsPersisting(true)
    try {
      const result = await saveCommercialInvoice(getInvoicePayload())
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      if (result.invoices) setSavedInvoices(result.invoices)
      if (result.invoice) {
        setCurrentInvoiceId(result.invoice.id)
        setSelectedSavedInvoiceId(result.invoice.id)
      }
      toast.success("Commercial invoice saved as new.")
    } catch {
      toast.error("Failed to save commercial invoice as new.")
    } finally {
      setIsPersisting(false)
    }
  }

  async function handleLoadSavedInvoice() {
    if (!selectedSavedInvoiceId) {
      toast.error("Choose a saved invoice to load.")
      return
    }
    setIsPersisting(true)
    try {
      const invoice = await getCommercialInvoice(selectedSavedInvoiceId)
      if (!invoice) {
        toast.error("Saved invoice could not be loaded.")
        return
      }
      applySavedInvoice(invoice)
      toast.success("Commercial invoice loaded.")
    } catch {
      toast.error("Failed to load commercial invoice.")
    } finally {
      setIsPersisting(false)
    }
  }

  async function handleDeleteSavedInvoice() {
    if (!selectedSavedInvoiceId) {
      toast.error("Choose a saved invoice to delete.")
      return
    }
    if (pendingDeleteId !== selectedSavedInvoiceId) {
      setPendingDeleteId(selectedSavedInvoiceId)
      toast.info("Press Confirm Delete to remove the selected saved invoice.")
      return
    }
    setIsPersisting(true)
    try {
      const result = await deleteCommercialInvoice(selectedSavedInvoiceId)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      if (result.invoices) setSavedInvoices(result.invoices)
      if (currentInvoiceId === selectedSavedInvoiceId) setCurrentInvoiceId("")
      setSelectedSavedInvoiceId("")
      setPendingDeleteId("")
      toast.success(result.message)
    } catch {
      toast.error("Failed to delete commercial invoice.")
    } finally {
      setIsPersisting(false)
    }
  }

  async function handleExportExcel() {
    const exportData = getValidatedExportData()
    if (!exportData) return
    try {
      const ExcelJS = await import("exceljs")
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Commercial Invoice")
      const currencyFormat = getCurrencyFormat(exportData.details.currency)
      worksheet.columns = [
        { width: 20 },
        { width: 24 },
        { width: 18 },
        { width: 28 },
        { width: 14 },
        { width: 10 },
        { width: 14 },
        { width: 22 },
        { width: 22 },
      ]
      worksheet.mergeCells("A1:I1")
      worksheet.getCell("A1").value = "Commercial Invoice"
      worksheet.getCell("A1").font = { bold: true, size: 16 }
      const detailRows = [
        ["Invoice No / Reference", exportData.details.reference],
        ["Date", exportData.details.date],
        ["Ship Date", exportData.details.shipDate],
        ["Tracking", exportData.details.tracking],
        ["Box Count", exportData.details.boxCount],
        ["Weight", exportData.details.weight],
        ["Currency", exportData.details.currency],
        ["Print Location", exportData.details.printLocation],
        ["Duties Payable By", exportData.details.dutiesPayableBy],
      ]
      detailRows.forEach((row, index) => {
        const excelRow = worksheet.getRow(index + 3)
        excelRow.values = row
        excelRow.getCell(1).font = { bold: true }
      })
      const senderStart = 13
      worksheet.getCell(`A${senderStart}`).value = "Sender"
      worksheet.getCell(`A${senderStart}`).font = { bold: true }
      getAddressRows(exportData.sender).forEach((row, index) => {
        const excelRow = worksheet.getRow(senderStart + index + 1)
        excelRow.values = row
        excelRow.getCell(1).font = { bold: true }
      })
      worksheet.getCell(`D${senderStart}`).value = "Receiver"
      worksheet.getCell(`D${senderStart}`).font = { bold: true }
      getAddressRows(exportData.receiver).forEach((row, index) => {
        const excelRow = worksheet.getRow(senderStart + index + 1)
        excelRow.getCell(4).value = row[0]
        excelRow.getCell(5).value = row[1]
        excelRow.getCell(4).font = { bold: true }
      })
      const tableHeaderRowNumber = senderStart + 13
      const tableHeaderRow = worksheet.getRow(tableHeaderRowNumber)
      tableHeaderRow.values = LINE_ITEM_HEADERS
      tableHeaderRow.font = { bold: true }
      exportData.lineItems.forEach((item, index) => {
        const row = worksheet.getRow(tableHeaderRowNumber + index + 1)
        row.values = [
          item.product,
          item.designName,
          item.type,
          item.description,
          item.costValue,
          item.quantityValue,
          item.totalValue,
          item.commodityCode,
          item.countryOfOrigin,
        ]
        row.getCell(5).numFmt = currencyFormat
        row.getCell(7).numFmt = currencyFormat
      })
      const totalRowNumber = tableHeaderRowNumber + exportData.lineItems.length + 2
      worksheet.getCell(`A${totalRowNumber}`).value = "Total Quantity"
      worksheet.getCell(`B${totalRowNumber}`).value = exportData.summary.quantity
      worksheet.getCell(`A${totalRowNumber + 1}`).value = "Final Invoice Total"
      worksheet.getCell(`B${totalRowNumber + 1}`).value = exportData.summary.total
      worksheet.getCell(`B${totalRowNumber + 1}`).numFmt = currencyFormat
      worksheet.getCell(`A${totalRowNumber}`).font = { bold: true }
      worksheet.getCell(`A${totalRowNumber + 1}`).font = { bold: true }
      const declarationStart = totalRowNumber + 4
      worksheet.getCell(`A${declarationStart}`).value = "Declaration"
      worksheet.getCell(`A${declarationStart}`).font = { bold: true }
      worksheet.mergeCells(`A${declarationStart + 1}:I${declarationStart + 2}`)
      worksheet.getCell(`A${declarationStart + 1}`).value =
        `I declare that the information on this commercial invoice is true and correct and that the goods were printed in ${exportData.details.printLocation}.`
      worksheet.getCell(`A${declarationStart + 1}`).alignment = { wrapText: true, vertical: "top" }
      worksheet.getCell(`A${declarationStart + 4}`).value = "Name:"
      worksheet.getCell(`B${declarationStart + 4}`).value = "____________________________"
      worksheet.getCell(`D${declarationStart + 4}`).value = "Signature:"
      worksheet.getCell(`E${declarationStart + 4}`).value = "____________________________"
      worksheet.getCell(`G${declarationStart + 4}`).value = "Date:"
      worksheet.getCell(`H${declarationStart + 4}`).value = "________________"
      ;["A", "D", "G"].forEach((column) => {
        worksheet.getCell(`${column}${declarationStart + 4}`).font = { bold: true }
      })
      const buffer = await workbook.xlsx.writeBuffer()
      downloadBlob(
        new Blob([buffer as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${getBaseFilename(exportData.details)}.xlsx`,
      )
      toast.success("Editable Excel invoice exported.")
    } catch {
      toast.error("Failed to export Excel invoice.")
    }
  }

  async function handleExportPdf() {
    const exportData = getValidatedExportData()
    if (!exportData) return
    try {
      const { jsPDF } = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Commercial Invoice", 40, 36)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      ;[
        `Invoice No / Reference: ${exportData.details.reference}`,
        `Date: ${exportData.details.date}`,
        `Ship Date: ${exportData.details.shipDate}`,
        `Tracking: ${exportData.details.tracking}`,
        `Box Count: ${exportData.details.boxCount}`,
        `Weight: ${exportData.details.weight}`,
        `Currency: ${exportData.details.currency}`,
        `Print Location: ${exportData.details.printLocation}`,
        `Duties Payable By: ${exportData.details.dutiesPayableBy}`,
      ].forEach((row, index) => doc.text(row, 40, 58 + index * 13))
      doc.setFont("helvetica", "bold")
      doc.text("Sender", 330, 58)
      doc.text("Receiver", 570, 58)
      doc.setFont("helvetica", "normal")
      doc.text(getAddressBlock(exportData.sender), 330, 74, { maxWidth: 210 })
      doc.text(getAddressBlock(exportData.receiver), 570, 74, { maxWidth: 220 })
      autoTable(doc, {
        startY: 205,
        head: [LINE_ITEM_HEADERS],
        body: exportData.lineItems.map((item) => [
          item.product,
          item.designName,
          item.type,
          item.description,
          formatMoney(item.costValue, exportData.details.currency),
          item.quantityValue.toLocaleString("en-GB"),
          formatMoney(item.totalValue, exportData.details.currency),
          item.commodityCode,
          item.countryOfOrigin,
        ]),
        styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: [32, 32, 32], textColor: [255, 255, 255] },
        columnStyles: { 3: { cellWidth: 120 }, 7: { cellWidth: 82 }, 8: { cellWidth: 88 } },
        margin: { left: 40, right: 40 },
      })
      const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 420
      doc.setFont("helvetica", "bold")
      doc.text(`Total Quantity: ${exportData.summary.quantity.toLocaleString("en-GB")}`, 40, finalY + 24)
      doc.text(`Final Invoice Total: ${formatMoney(exportData.summary.total, exportData.details.currency)}`, 40, finalY + 40)
      const declarationY = finalY + 72
      if (declarationY > 520) doc.addPage()
      const sectionY = declarationY > 520 ? 48 : declarationY
      doc.setFont("helvetica", "bold")
      doc.text("Declaration", 40, sectionY)
      doc.setFont("helvetica", "normal")
      doc.text(
        `Print Location: ${exportData.details.printLocation}`,
        40,
        sectionY + 16,
      )
      doc.text(
        `I declare that the information on this commercial invoice is true and correct and that the goods were printed in ${exportData.details.printLocation}.`,
        40,
        sectionY + 34,
        { maxWidth: 760 },
      )
      doc.text("Name: ____________________________", 40, sectionY + 72)
      doc.text("Signature: ____________________________", 300, sectionY + 72)
      doc.text("Date: __________________", 600, sectionY + 72)
      doc.save(`${getBaseFilename(exportData.details)}.pdf`)
      toast.success("PDF invoice exported.")
    } catch {
      toast.error("Failed to export PDF invoice.")
    }
  }

  return (
    <div className="grid gap-4">
      <section className="hub-panel grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-cream">Invoice Details</h2>
            {/* <p className="mt-1 text-sm text-brand-muted">Duties payer must be selected for every invoice.</p> */}
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
 <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-print-location">
 Print Location
 <select
 id="invoice-print-location"
 value={details.printLocation}
 onChange={(event) => updateDetails("printLocation", event.target.value as PrintLocation)}
 className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
 >
 <option value="">Select print location</option>
 <option value="United Kingdom">United Kingdom</option>
 <option value="Hungary">Hungary</option>
 </select>
 {/* <span className="text-xs font-normal leading-5 text-brand-muted">
 Print location is used for the declaration/signature section. Country of Origin on line items is where
 the blank garment/product was made.
 </span> */}
 {!details.printLocation ? (
 <span className="text-xs font-medium text-brand-red/90">Required before export.</span>
 ) : null}
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

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <AddressSection
          title="Sender"
          address={sender}
          savedAddresses={savedAddressOptions}
          selectedAddressId={senderAddressId}
          onSelectAddress={(addressId) => selectAddress(addressId, "sender")}
          onChangeAddress={(field, value) => setSender((current) => ({ ...current, [field]: value }))}
        />
        <AddressSection
          title="Receiver"
          address={receiver}
          savedAddresses={savedAddressOptions}
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
              Commodity code follows product type/material, not brand. Country of origin stays editable and garment/product
              specific; it is not derived from commodity code.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
 <Link
 href="/hub/data/commodity-codes"
 className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
 >
 Manage Commodity Codes
 </Link>
 <button
 type="button"
 onClick={() => setLineItems((current) => [...current, createLineItem()])}
 className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold"
 >
 Add Line
 </button>
 </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-brand-border">
          <table className="min-w-[1360px] w-full border-collapse text-left text-sm">
            <thead className="bg-brand-panel-alt/80 text-xs uppercase tracking-[0.12em] text-brand-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Product</th>
                <th className="px-3 py-2 font-semibold">Design Name</th>
                <th className="px-3 py-2 font-semibold">Type / Material</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 font-semibold">Cost</th>
                <th className="px-3 py-2 font-semibold">Qty</th>
                <th className="px-3 py-2 font-semibold">Total</th>
                <th className="px-3 py-2 font-semibold">Commodity Code</th>
                <th className="px-3 py-2 font-semibold">Country of Origin</th>
                <th className="px-3 py-2 font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => {
                const cooMetadata = getCountryOfOriginMetadata(item)
                const cooSelectValue = getCountryOfOriginSelectValue(item)
                const isManualCountryOfOrigin =
                  cooMetadata.mode === "VARIABLE" &&
                  (manualCountryOfOriginLines[item.id] || cooSelectValue === MANUAL_COUNTRY_OF_ORIGIN)

                return (
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
                  <td className="min-w-[150px] px-2 py-2">
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
                      inputMode="numeric"
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
                  <td className="min-w-[230px] px-2 py-2">
                    <select
                      value=""
                      onChange={(event) => applyCommodityReference(item.id, event.target.value)}
                      className="hub-input mb-2 w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    >
                      <option value="">Commodity reference</option>
                      {commodityCodes.map((code) => (
                        <option key={code.id} value={code.id}>
                          {getCommodityLabel(code)}
                        </option>
                      ))}
                    </select>
                    <input
                      value={item.commodityCode}
                      onChange={(event) => updateLineItem(item.id, "commodityCode", event.target.value)}
                      placeholder="Example: 6109100010"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                    <p className="mt-1 text-[11px] leading-4 text-brand-muted">Product/material/type based, not brand.</p>
                  </td>
                  <td className="min-w-[230px] px-2 py-2">
                    {cooMetadata.mode === "VARIABLE" ? (
                      <div className="grid gap-1.5">
                        <select
                          value={isManualCountryOfOrigin ? MANUAL_COUNTRY_OF_ORIGIN : cooSelectValue}
                          onChange={(event) => {
                            const nextValue = event.target.value
                            setManualCountryOfOriginLines((current) => {
                              if (nextValue === MANUAL_COUNTRY_OF_ORIGIN) return { ...current, [item.id]: true }
                              const rest = { ...current }
                              delete rest[item.id]
                              return rest
                            })
                            updateLineItem(
                              item.id,
                              "countryOfOrigin",
                              nextValue === MANUAL_COUNTRY_OF_ORIGIN ? "" : nextValue,
                            )
                          }}
                          className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                        >
                          <option value="">Select origin</option>
                          {cooMetadata.options?.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                          <option value={MANUAL_COUNTRY_OF_ORIGIN}>Other / manual</option>
                        </select>
                        {isManualCountryOfOrigin ? (
                          <input
                            value={item.countryOfOrigin}
                            onChange={(event) => updateLineItem(item.id, "countryOfOrigin", event.target.value)}
                            placeholder="Manual origin"
                            className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                          />
                        ) : null}
                        <p className="text-[11px] leading-4 text-brand-muted">
                          Select the origin shown on the garment label.
                        </p>
                      </div>
                    ) : (
                      <>
                        <input
                          value={item.countryOfOrigin}
                          onChange={(event) => updateLineItem(item.id, "countryOfOrigin", event.target.value)}
                          placeholder={cooMetadata.mode === "FIXED" ? "Known origin" : "Actual garment origin"}
                          className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                        />
                        <p className="mt-1 text-[11px] leading-4 text-brand-muted">
                          {cooMetadata.mode === "UNKNOWN"
                            ? "Check garment label or supplier spec sheet."
                            : "Known origin auto-filled when available; still editable."}
                        </p>
                      </>
                    )}
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
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hub-panel grid gap-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-brand-cream">Saved Invoices</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Save invoice snapshots for reuse later. Sender and receiver details are stored with each saved invoice.
            </p>
            {initialData.setupIssue ? <p className="mt-2 text-sm text-brand-red/90">{initialData.setupIssue}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button
              type="button"
              onClick={handleSaveInvoice}
              disabled={isPersisting || Boolean(initialData.setupIssue)}
              className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Invoice
            </button>
            {currentInvoiceId ? (
              <button
                type="button"
                onClick={handleSaveAsNewInvoice}
                disabled={isPersisting || Boolean(initialData.setupIssue)}
                className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save as New
              </button>
            ) : null}
          </div>
        </div>
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor="saved-commercial-invoice">
            Saved Invoice
            <select
              id="saved-commercial-invoice"
              value={selectedSavedInvoiceId}
              onChange={(event) => {
                setSelectedSavedInvoiceId(event.target.value)
                setPendingDeleteId("")
              }}
              disabled={isPersisting || !savedInvoices.length}
              className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{savedInvoices.length ? "Choose saved invoice" : "No saved invoices yet"}</option>
              {savedInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {getSavedInvoiceLabel(invoice)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button
              type="button"
              onClick={handleLoadSavedInvoice}
              disabled={isPersisting || !selectedSavedInvoiceId}
              className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Load Invoice
            </button>
            <button
              type="button"
              onClick={handleDeleteSavedInvoice}
              disabled={isPersisting || !selectedSavedInvoiceId}
              className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pendingDeleteId === selectedSavedInvoiceId ? "Confirm Delete" : "Delete"}
            </button>
          </div>
        </div>
      </section>

      <section className="hub-panel grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-brand-cream">Summary / Export</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleExportExcel} className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold">
              Export Editable Excel
            </button>
            <button type="button" onClick={handleExportPdf} className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold">
              Export PDF
            </button>
          </div>
        </div>
        {validationErrors.length ? (
          <div className="rounded-2xl border border-brand-red/45 bg-brand-red/10 px-4 py-3 text-sm text-brand-cream">
            <p className="font-semibold">Export or save blocked until required fields are complete:</p>
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
