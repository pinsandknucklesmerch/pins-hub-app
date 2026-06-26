export type CommercialInvoiceAddressSnapshot = {
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
  email: string
  notes: string
}

export type CommercialInvoiceDetailsPayload = {
  reference: string
  date: string
  shipDate: string
  tracking: string
  boxCount: string
  weight: string
  currency: "GBP" | "EUR"
  printLocation: "" | "United Kingdom" | "Hungary"
  dutiesPayableBy: "" | "Sender" | "Receiver"
}

export type CommercialInvoiceLinePayload = {
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

export type CommercialInvoicePayload = {
  title?: string
  details: CommercialInvoiceDetailsPayload
  sender: CommercialInvoiceAddressSnapshot
  receiver: CommercialInvoiceAddressSnapshot
  lineItems: CommercialInvoiceLinePayload[]
}

export type SavedCommercialInvoiceSummary = {
  id: string
  title: string | null
  invoiceNumber: string
  reference: string | null
  invoiceDate: string | null
  updatedAt: string
  invoiceTotal: string
  totalQuantity: number
}

export type SavedCommercialInvoiceRecord = SavedCommercialInvoiceSummary & {
  details: CommercialInvoiceDetailsPayload
  sender: CommercialInvoiceAddressSnapshot
  receiver: CommercialInvoiceAddressSnapshot
  lineItems: CommercialInvoiceLinePayload[]
}

export type CommercialInvoicesData = {
  invoices: SavedCommercialInvoiceSummary[]
  addresses: SavedInvoiceAddressRecord[]
  commodityCodes: CommercialInvoiceCommodityCodeRecord[]
  setupIssue?: string
}

export type CommercialInvoiceActionResult = {
  ok: boolean
  message: string
  invoice?: SavedCommercialInvoiceRecord
  invoices?: SavedCommercialInvoiceSummary[]
}

export type SavedInvoiceAddressPayload = {
  label: string
  companyName: string
  contactName: string
  address: string
  country: string
  eori: string
  vat: string
  ein: string
  telephone: string
  email: string
  notes: string
}

export type SavedInvoiceAddressRecord = SavedInvoiceAddressPayload & {
  id: string
  updatedAt: string
}

export type SavedInvoiceAddressActionResult = {
  ok: boolean
  message: string
  addresses?: SavedInvoiceAddressRecord[]
}

export type CommercialInvoiceCommodityCodePayload = {
  label: string
  productType: string
  material: string
  commodityCode: string
  description: string
  notes: string
}

export type CommercialInvoiceCommodityCodeRecord = CommercialInvoiceCommodityCodePayload & {
  id: string
  updatedAt: string
}

export type CommercialInvoiceCommodityCodeActionResult = {
  ok: boolean
  message: string
  commodityCodes?: CommercialInvoiceCommodityCodeRecord[]
}
