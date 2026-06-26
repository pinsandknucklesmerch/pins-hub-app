import { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"
import type {
  CommercialInvoiceCommodityCodeRecord,
  CommercialInvoiceAddressSnapshot,
  CommercialInvoicesData,
  SavedCommercialInvoiceRecord,
  SavedCommercialInvoiceSummary,
  SavedInvoiceAddressRecord,
} from "./types"

const COMMERCIAL_INVOICES_TAG = "commercial-invoices"
const SAVED_INVOICE_ADDRESSES_TAG = "saved-invoice-addresses"
const COMMERCIAL_INVOICE_COMMODITY_CODES_TAG = "commercial-invoice-commodity-codes"

type CommercialInvoiceRow = {
  id: string
  title: string | null
  invoiceNumber: string
  reference: string | null
  invoiceDate: Date | null
  shipDate: Date | null
  tracking: string | null
  boxCount: number | null
  weight: string | null
  currency: string
  printLocation: string | null
  dutiesPayableBy: string | null
  senderJson: Prisma.JsonValue
  receiverJson: Prisma.JsonValue
  totalQuantity: number
  invoiceTotal: Prisma.Decimal
  updatedAt: Date
  lines: CommercialInvoiceLineRow[]
}

type CommercialInvoiceLineRow = {
  id: string
  product: string | null
  designName: string | null
  productType: string | null
  description: string | null
  unitCost: Prisma.Decimal
  quantity: number
  lineTotal: Prisma.Decimal
  commodityCode: string | null
  countryOfOrigin: string | null
  sortOrder: number
}

type SavedInvoiceAddressRow = {
  id: string
  label: string
  companyName: string
  contactName: string | null
  address: string
  country: string
  eoriNumber: string | null
  vatNumber: string | null
  einNumber: string | null
  telephone: string | null
  email: string | null
  notes: string | null
  updatedAt: Date
}

type CommercialInvoiceCommodityCodeRow = {
  id: string
  label: string
  productType: string
  material: string | null
  commodityCode: string
  description: string | null
  notes: string | null
  updatedAt: Date
}

function hasCommercialInvoiceDelegate() {
  const client = prisma as typeof prisma & {
    commercialInvoice?: { findMany?: (...args: unknown[]) => unknown; findUnique?: (...args: unknown[]) => unknown }
  }

  return typeof client.commercialInvoice?.findMany === "function"
}

function hasSavedInvoiceAddressDelegate() {
  const client = prisma as typeof prisma & {
    savedInvoiceAddress?: { findMany?: (...args: unknown[]) => unknown }
  }

  return typeof client.savedInvoiceAddress?.findMany === "function"
}

function hasCommercialInvoiceCommodityCodeDelegate() {
  const client = prisma as typeof prisma & {
    commercialInvoiceCommodityCode?: { findMany?: (...args: unknown[]) => unknown }
  }

  return typeof client.commercialInvoiceCommodityCode?.findMany === "function"
}

export function getCommercialInvoicesTag() {
  return COMMERCIAL_INVOICES_TAG
}

export function getSavedInvoiceAddressesTag() {
  return SAVED_INVOICE_ADDRESSES_TAG
}

export function getCommercialInvoiceCommodityCodesTag() {
  return COMMERCIAL_INVOICE_COMMODITY_CODES_TAG
}

function asString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function normalizeAddress(value: Prisma.JsonValue): CommercialInvoiceAddressSnapshot {
  const address = typeof value === "object" && value !== null && !Array.isArray(value) ? value : {}

  return {
    id: asString(address.id),
    label: asString(address.label),
    companyName: asString(address.companyName),
    contactName: asString(address.contactName),
    address: asString(address.address),
    country: asString(address.country),
    eori: asString(address.eori),
    vat: asString(address.vat),
    ein: asString(address.ein),
    telephone: asString(address.telephone),
    email: asString(address.email),
    notes: asString(address.notes),
  }
}

function normalizeSavedCompanyName(label: string, companyName: string) {
  const key = `${label} ${companyName}`.trim().toLowerCase()
  if (key.includes("epcc")) return "The Embroidered & Printed Clothing Company"
  if (key.includes("sportimadok")) return "Sportimadok.hu kft"
  return companyName
}

function serializeAddress(row: SavedInvoiceAddressRow): SavedInvoiceAddressRecord {
  return {
    id: row.id,
    label: row.label,
    companyName: normalizeSavedCompanyName(row.label, row.companyName),
    contactName: row.contactName ?? "",
    address: row.address,
    country: row.country,
    eori: row.eoriNumber ?? "",
    vat: row.vatNumber ?? "",
    ein: row.einNumber ?? "",
    telephone: row.telephone ?? "",
    email: row.email ?? "",
    notes: row.notes ?? "",
    updatedAt: row.updatedAt.toISOString(),
  }
}

function serializeCommodityCode(row: CommercialInvoiceCommodityCodeRow): CommercialInvoiceCommodityCodeRecord {
  return {
    id: row.id,
    label: row.label,
    productType: row.productType,
    material: row.material ?? "",
    commodityCode: row.commodityCode,
    description: row.description ?? "",
    notes: row.notes ?? "",
    updatedAt: row.updatedAt.toISOString(),
  }
}

function serializeSummary(row: CommercialInvoiceRow): SavedCommercialInvoiceSummary {
  return {
    id: row.id,
    title: row.title,
    invoiceNumber: row.invoiceNumber,
    reference: row.reference,
    invoiceDate: row.invoiceDate?.toISOString().slice(0, 10) ?? null,
    updatedAt: row.updatedAt.toISOString(),
    invoiceTotal: row.invoiceTotal.toString(),
    totalQuantity: row.totalQuantity,
  }
}

function serializeInvoice(row: CommercialInvoiceRow): SavedCommercialInvoiceRecord {
  return {
    ...serializeSummary(row),
    details: {
      reference: row.invoiceNumber,
      date: row.invoiceDate?.toISOString().slice(0, 10) ?? "",
      shipDate: row.shipDate?.toISOString().slice(0, 10) ?? "",
      tracking: row.tracking ?? "",
      boxCount: row.boxCount?.toString() ?? "",
    weight: row.weight ?? "",
    currency: row.currency === "EUR" ? "EUR" : "GBP",
    printLocation:
      row.printLocation === "United Kingdom" || row.printLocation === "Hungary" ? row.printLocation : "",
    dutiesPayableBy: row.dutiesPayableBy === "Sender" || row.dutiesPayableBy === "Receiver" ? row.dutiesPayableBy : "",
    },
    sender: normalizeAddress(row.senderJson),
    receiver: normalizeAddress(row.receiverJson),
    lineItems: row.lines
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((line) => ({
        id: line.id,
        product: line.product ?? "",
        designName: line.designName ?? "",
        type: line.productType ?? "",
        description: line.description ?? "",
        cost: line.unitCost.toString(),
        quantity: line.quantity.toString(),
        commodityCode: line.commodityCode ?? "",
        countryOfOrigin: line.countryOfOrigin ?? "",
      })),
  }
}

async function loadCommercialInvoices(): Promise<CommercialInvoicesData> {
  if (!hasCommercialInvoiceDelegate()) {
    return {
      invoices: [],
      addresses: [],
      commodityCodes: [],
      setupIssue:
        "The running Prisma client does not include CommercialInvoice yet. Generate Prisma client and apply the migration before saving invoices.",
    }
  }

  try {
    const [invoices, addresses, commodityCodes] = await Promise.all([
      prisma.commercialInvoice.findMany({
        orderBy: { updatedAt: "desc" },
        include: { lines: { orderBy: { sortOrder: "asc" } } },
      }),
      loadSavedInvoiceAddresses(),
      loadCommercialInvoiceCommodityCodes(),
    ])

    return {
      invoices: invoices.map(serializeSummary),
      addresses,
      commodityCodes,
    }
  } catch (error) {
    console.error(error)
    return {
      invoices: [],
      addresses: [],
      commodityCodes: [],
      setupIssue: "Saved commercial invoices could not be loaded. Check database connection and migrations.",
    }
  }
}

export const listCommercialInvoices = unstable_cache(loadCommercialInvoices, ["commercial-invoices"], {
  tags: [COMMERCIAL_INVOICES_TAG, SAVED_INVOICE_ADDRESSES_TAG, COMMERCIAL_INVOICE_COMMODITY_CODES_TAG],
})

async function loadSavedInvoiceAddresses(): Promise<SavedInvoiceAddressRecord[]> {
  if (!hasSavedInvoiceAddressDelegate()) return []

  const addresses = await prisma.savedInvoiceAddress.findMany({
    orderBy: [{ label: "asc" }, { updatedAt: "desc" }],
  })

  return addresses.map(serializeAddress)
}

export const listSavedInvoiceAddresses = unstable_cache(loadSavedInvoiceAddresses, ["saved-invoice-addresses"], {
  tags: [SAVED_INVOICE_ADDRESSES_TAG],
})

async function loadCommercialInvoiceCommodityCodes(): Promise<CommercialInvoiceCommodityCodeRecord[]> {
  if (!hasCommercialInvoiceCommodityCodeDelegate()) return []

  const commodityCodes = await prisma.commercialInvoiceCommodityCode.findMany({
    orderBy: [{ label: "asc" }, { productType: "asc" }],
  })

  return commodityCodes.map(serializeCommodityCode)
}

export const listCommercialInvoiceCommodityCodes = unstable_cache(
  loadCommercialInvoiceCommodityCodes,
  ["commercial-invoice-commodity-codes"],
  {
    tags: [COMMERCIAL_INVOICE_COMMODITY_CODES_TAG],
  },
)

export async function getCommercialInvoice(id: string): Promise<SavedCommercialInvoiceRecord | null> {
  if (!hasCommercialInvoiceDelegate()) return null

  const invoice = await prisma.commercialInvoice.findUnique({
    where: { id },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  })

  return invoice ? serializeInvoice(invoice) : null
}
