"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/db"
import {
  getCommercialInvoice,
  getCommercialInvoiceCommodityCodesTag,
  getCommercialInvoicesTag,
  getSavedInvoiceAddressesTag,
  listCommercialInvoiceCommodityCodes,
  listCommercialInvoices,
  listSavedInvoiceAddresses,
} from "./data"
import type {
  CommercialInvoiceActionResult,
  CommercialInvoiceAddressSnapshot,
  CommercialInvoiceCommodityCodeActionResult,
  CommercialInvoiceCommodityCodePayload,
  CommercialInvoiceLinePayload,
  CommercialInvoicePayload,
  SavedInvoiceAddressActionResult,
  SavedInvoiceAddressPayload,
} from "./types"

function normalizeText(value: string | undefined | null) {
  return typeof value === "string" ? value.trim() : ""
}

function parseOptionalDate(value: string) {
  const normalized = normalizeText(value)
  return normalized ? new Date(`${normalized}T00:00:00.000Z`) : null
}

function parseOptionalInt(value: string) {
  const normalized = normalizeText(value)
  if (!normalized) return null

  const parsed = Number.parseInt(normalized, 10)
  return Number.isInteger(parsed) ? parsed : null
}

function parseMoney(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseQuantity(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) ? parsed : 0
}

function hasLineItemContent(item: CommercialInvoiceLinePayload) {
  return [
    item.product,
    item.designName,
    item.type,
    item.description,
    item.cost,
    item.quantity,
    item.commodityCode,
    item.countryOfOrigin,
  ].some((value) => normalizeText(value))
}

function isValidLineItem(item: CommercialInvoiceLinePayload) {
  return Boolean(normalizeText(item.product)) && parseQuantity(item.quantity) > 0 && Number.isFinite(parseMoney(item.cost))
}

function validateAddress(address: CommercialInvoiceAddressSnapshot, label: string) {
  if (!normalizeText(address.companyName) || !normalizeText(address.address)) {
    return `${label} company name and address are required.`
  }

  return null
}

function validatePayload(payload: CommercialInvoicePayload) {
  const errors: string[] = []
  const contentLines = payload.lineItems.filter(hasLineItemContent)

  if (!normalizeText(payload.details.reference)) errors.push("Invoice No / Reference is required.")
  if (!payload.details.printLocation) errors.push("Print Location is required.")
  if (!payload.details.dutiesPayableBy) errors.push("Duties Payable By must be selected.")

  const senderError = validateAddress(payload.sender, "Sender")
  if (senderError) errors.push(senderError)

  const receiverError = validateAddress(payload.receiver, "Receiver")
  if (receiverError) errors.push(receiverError)

  if (!contentLines.length) errors.push("At least one line item is required.")
  else if (contentLines.some((line) => !isValidLineItem(line))) {
    errors.push("Every saved line item needs product, cost, and whole-number quantity.")
  }

  return errors
}

function getLineData(lineItems: CommercialInvoiceLinePayload[]) {
  return lineItems.filter(hasLineItemContent).map((line, index) => {
    const unitCost = parseMoney(line.cost)
    const quantity = parseQuantity(line.quantity)

    return {
      product: normalizeText(line.product) || null,
      designName: normalizeText(line.designName) || null,
      productType: normalizeText(line.type) || null,
      description: normalizeText(line.description) || null,
      unitCost: unitCost.toFixed(2),
      quantity,
      lineTotal: (unitCost * quantity).toFixed(2),
      commodityCode: normalizeText(line.commodityCode) || null,
      countryOfOrigin: normalizeText(line.countryOfOrigin) || null,
      sortOrder: index,
    }
  })
}

function getInvoiceData(payload: CommercialInvoicePayload) {
  const lines = getLineData(payload.lineItems)
  const totalQuantity = lines.reduce((total, line) => total + line.quantity, 0)
  const invoiceTotal = lines.reduce((total, line) => total + Number.parseFloat(line.lineTotal), 0)
  const invoiceNumber = normalizeText(payload.details.reference)

  return {
    title: normalizeText(payload.title) || null,
    invoiceNumber,
    reference: invoiceNumber,
    invoiceDate: parseOptionalDate(payload.details.date),
    shipDate: parseOptionalDate(payload.details.shipDate),
    tracking: normalizeText(payload.details.tracking) || null,
    boxCount: parseOptionalInt(payload.details.boxCount),
    weight: normalizeText(payload.details.weight) || null,
    currency: payload.details.currency,
    printLocation: normalizeText(payload.details.printLocation) || null,
    dutiesPayableBy: payload.details.dutiesPayableBy || null,
    senderJson: payload.sender as unknown as Prisma.InputJsonValue,
    receiverJson: payload.receiver as unknown as Prisma.InputJsonValue,
    totalQuantity,
    invoiceTotal: invoiceTotal.toFixed(2),
    lines,
  }
}

function getAddressData(payload: SavedInvoiceAddressPayload) {
  return {
    label: normalizeText(payload.label),
    companyName: normalizeText(payload.companyName),
    contactName: normalizeText(payload.contactName) || null,
    address: normalizeText(payload.address),
    country: normalizeText(payload.country),
    eoriNumber: normalizeText(payload.eori) || null,
    vatNumber: normalizeText(payload.vat) || null,
    einNumber: normalizeText(payload.ein) || null,
    telephone: normalizeText(payload.telephone) || null,
    email: normalizeText(payload.email) || null,
    notes: normalizeText(payload.notes) || null,
  }
}

function validateSavedAddressPayload(payload: SavedInvoiceAddressPayload) {
  const errors: string[] = []
  if (!normalizeText(payload.label)) errors.push("Address label is required.")
  if (!normalizeText(payload.companyName)) errors.push("Company name is required.")
  if (!normalizeText(payload.address)) errors.push("Address is required.")
  if (!normalizeText(payload.country)) errors.push("Country is required.")
  return errors
}

function getCommodityCodeData(payload: CommercialInvoiceCommodityCodePayload) {
  return {
    label: normalizeText(payload.label),
    productType: normalizeText(payload.productType),
    material: normalizeText(payload.material) || null,
    commodityCode: normalizeText(payload.commodityCode),
    description: normalizeText(payload.description) || null,
    notes: normalizeText(payload.notes) || null,
  }
}

function validateCommodityCodePayload(payload: CommercialInvoiceCommodityCodePayload) {
  const errors: string[] = []
  if (!normalizeText(payload.label)) errors.push("Commodity label is required.")
  if (!normalizeText(payload.productType)) errors.push("Product type is required.")
  if (!normalizeText(payload.commodityCode)) errors.push("Commodity code is required.")
  return errors
}

async function revalidateCommercialInvoices() {
  revalidateTag(getCommercialInvoicesTag(), "max")
  revalidatePath("/hub/commercial-invoices")
}

async function revalidateSavedInvoiceAddresses() {
  revalidateTag(getSavedInvoiceAddressesTag(), "max")
  revalidateTag(getCommercialInvoicesTag(), "max")
  revalidatePath("/hub/commercial-invoices")
  revalidatePath("/hub/data/addresses")
}

async function revalidateCommercialInvoiceCommodityCodes() {
  revalidateTag(getCommercialInvoiceCommodityCodesTag(), "max")
  revalidateTag(getCommercialInvoicesTag(), "max")
  revalidatePath("/hub/commercial-invoices")
  revalidatePath("/hub/data/commodity-codes")
}

async function buildSuccessResult(message: string, invoiceId: string): Promise<CommercialInvoiceActionResult> {
  const [invoice, data] = await Promise.all([getCommercialInvoice(invoiceId), listCommercialInvoices()])

  return {
    ok: true,
    message,
    invoice: invoice ?? undefined,
    invoices: data.invoices,
  }
}

export {
  getCommercialInvoice,
  listCommercialInvoiceCommodityCodes,
  listCommercialInvoices,
  listSavedInvoiceAddresses,
}

export async function saveCommercialInvoice(payload: CommercialInvoicePayload): Promise<CommercialInvoiceActionResult> {
  const errors = validatePayload(payload)
  if (errors.length) return { ok: false, message: errors.join(" ") }

  try {
    const data = getInvoiceData(payload)
    const invoice = await prisma.commercialInvoice.create({
      data: {
        ...data,
        lines: { create: data.lines },
      },
      select: { id: true },
    })

    await revalidateCommercialInvoices()
    return buildSuccessResult("Commercial invoice saved.", invoice.id)
  } catch (error) {
    console.error(error)
    return { ok: false, message: error instanceof Error ? error.message : "Failed to save commercial invoice." }
  }
}

export async function updateCommercialInvoice(
  id: string,
  payload: CommercialInvoicePayload,
): Promise<CommercialInvoiceActionResult> {
  const errors = validatePayload(payload)
  if (errors.length) return { ok: false, message: errors.join(" ") }

  try {
    const data = getInvoiceData(payload)
    const invoice = await prisma.commercialInvoice.update({
      where: { id },
      data: {
        ...data,
        lines: {
          deleteMany: {},
          create: data.lines,
        },
      },
      select: { id: true },
    })

    await revalidateCommercialInvoices()
    return buildSuccessResult("Commercial invoice updated.", invoice.id)
  } catch (error) {
    console.error(error)
    return { ok: false, message: error instanceof Error ? error.message : "Failed to update commercial invoice." }
  }
}

export async function deleteCommercialInvoice(id: string): Promise<CommercialInvoiceActionResult> {
  if (!id) return { ok: false, message: "Commercial invoice is required." }

  try {
    await prisma.commercialInvoice.delete({ where: { id } })
    await revalidateCommercialInvoices()
    const data = await listCommercialInvoices()

    return { ok: true, message: "Commercial invoice deleted.", invoices: data.invoices }
  } catch (error) {
    console.error(error)
    return { ok: false, message: error instanceof Error ? error.message : "Failed to delete commercial invoice." }
  }
}

export async function createSavedInvoiceAddress(
  payload: SavedInvoiceAddressPayload,
): Promise<SavedInvoiceAddressActionResult> {
  const errors = validateSavedAddressPayload(payload)
  if (errors.length) return { ok: false, message: errors.join(" ") }

  try {
    await prisma.savedInvoiceAddress.create({ data: getAddressData(payload) })
    await revalidateSavedInvoiceAddresses()
    return {
      ok: true,
      message: "Saved address created.",
      addresses: await listSavedInvoiceAddresses(),
    }
  } catch (error) {
    console.error(error)
    return { ok: false, message: error instanceof Error ? error.message : "Failed to create saved address." }
  }
}

export async function updateSavedInvoiceAddress(
  id: string,
  payload: SavedInvoiceAddressPayload,
): Promise<SavedInvoiceAddressActionResult> {
  const errors = validateSavedAddressPayload(payload)
  if (errors.length) return { ok: false, message: errors.join(" ") }

  try {
    await prisma.savedInvoiceAddress.update({ where: { id }, data: getAddressData(payload) })
    await revalidateSavedInvoiceAddresses()
    return {
      ok: true,
      message: "Saved address updated.",
      addresses: await listSavedInvoiceAddresses(),
    }
  } catch (error) {
    console.error(error)
    return { ok: false, message: error instanceof Error ? error.message : "Failed to update saved address." }
  }
}

export async function deleteSavedInvoiceAddress(id: string): Promise<SavedInvoiceAddressActionResult> {
  if (!id) return { ok: false, message: "Saved address is required." }

  try {
    await prisma.savedInvoiceAddress.delete({ where: { id } })
    await revalidateSavedInvoiceAddresses()
    return {
      ok: true,
      message: "Saved address deleted.",
      addresses: await listSavedInvoiceAddresses(),
    }
  } catch (error) {
    console.error(error)
    return { ok: false, message: error instanceof Error ? error.message : "Failed to delete saved address." }
  }
}

export async function createCommercialInvoiceCommodityCode(
  payload: CommercialInvoiceCommodityCodePayload,
): Promise<CommercialInvoiceCommodityCodeActionResult> {
  const errors = validateCommodityCodePayload(payload)
  if (errors.length) return { ok: false, message: errors.join(" ") }

  try {
    await prisma.commercialInvoiceCommodityCode.create({ data: getCommodityCodeData(payload) })
    await revalidateCommercialInvoiceCommodityCodes()
    return {
      ok: true,
      message: "Commodity code created.",
      commodityCodes: await listCommercialInvoiceCommodityCodes(),
    }
  } catch (error) {
    console.error(error)
    return { ok: false, message: error instanceof Error ? error.message : "Failed to create commodity code." }
  }
}

export async function updateCommercialInvoiceCommodityCode(
  id: string,
  payload: CommercialInvoiceCommodityCodePayload,
): Promise<CommercialInvoiceCommodityCodeActionResult> {
  const errors = validateCommodityCodePayload(payload)
  if (errors.length) return { ok: false, message: errors.join(" ") }

  try {
    await prisma.commercialInvoiceCommodityCode.update({ where: { id }, data: getCommodityCodeData(payload) })
    await revalidateCommercialInvoiceCommodityCodes()
    return {
      ok: true,
      message: "Commodity code updated.",
      commodityCodes: await listCommercialInvoiceCommodityCodes(),
    }
  } catch (error) {
    console.error(error)
    return { ok: false, message: error instanceof Error ? error.message : "Failed to update commodity code." }
  }
}

export async function deleteCommercialInvoiceCommodityCode(
  id: string,
): Promise<CommercialInvoiceCommodityCodeActionResult> {
  if (!id) return { ok: false, message: "Commodity code is required." }

  try {
    await prisma.commercialInvoiceCommodityCode.delete({ where: { id } })
    await revalidateCommercialInvoiceCommodityCodes()
    return {
      ok: true,
      message: "Commodity code deleted.",
      commodityCodes: await listCommercialInvoiceCommodityCodes(),
    }
  } catch (error) {
    console.error(error)
    return { ok: false, message: error instanceof Error ? error.message : "Failed to delete commodity code." }
  }
}
