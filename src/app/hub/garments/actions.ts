"use server"

import { prisma } from "@/lib/db"
import { revalidatePath, revalidateTag } from "next/cache"
import { GarmentType } from "@prisma/client"
import { getCalculatorReferenceTag } from "../calculators/data"
import { getUkTradeGarmentsTag } from "../calculators/uk/trade/data"
import { getGarmentDirectoryTag } from "./data"

function normalizeTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return ""
  }

  const seen = new Set<string>()

  return value
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase()

      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
    .join(", ")
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeCode(value: FormDataEntryValue | null) {
  return normalizeText(value).replace(/-(white|black)$/i, "")
}

function normalizeOptionalFloat(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null
  }

  return parseFloat(value)
}

export async function addGarment(formData: FormData) {
  const code = normalizeCode(formData.get("code"))
  const altCode = normalizeText(formData.get("altCode"))
  const brandName = normalizeText(formData.get("brandName"))
  const name = normalizeText(formData.get("name"))
  const color = normalizeText(formData.get("color"))
  const type = formData.get("type") as GarmentType
  const basePrice = parseFloat(formData.get("basePrice") as string)
  const gbpPrice = normalizeOptionalFloat(formData.get("gbpPrice"))
  const extraSizeCost = normalizeOptionalFloat(formData.get("extraSizeCost"))
  const tags = normalizeTags(formData.get("tags"))

  await prisma.garment.create({
    data: {
      code,
      altCode,
      brandName,
      name,
      color,
      type,
      basePrice,
      gbpPrice,
      extraSizeCost,
      tags
    }
  })

  revalidateTag(getGarmentDirectoryTag(), "max")
  revalidateTag(getCalculatorReferenceTag(), "max")
  revalidateTag(getUkTradeGarmentsTag(), "max")
  revalidatePath("/hub/garments")
  revalidatePath("/hub/calculators/eu/standard")
  revalidatePath("/hub/calculators/eu/us-clients")
  revalidatePath("/hub/calculators/uk/trade")
}

export async function updateGarmentDetails(formData: FormData) {
  const id = formData.get("id")

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Missing garment id")
  }

  await prisma.garment.update({
    where: { id },
    data: {
      code: normalizeCode(formData.get("code")),
      altCode: normalizeText(formData.get("altCode")),
      brandName: normalizeText(formData.get("brandName")),
      name: normalizeText(formData.get("name")),
      color: normalizeText(formData.get("color")),
      type: formData.get("type") as GarmentType,
      basePrice: parseFloat(formData.get("basePrice") as string),
      gbpPrice: normalizeOptionalFloat(formData.get("gbpPrice")),
      extraSizeCost: normalizeOptionalFloat(formData.get("extraSizeCost")),
      tags: normalizeTags(formData.get("tags"))
    }
  })

  revalidateTag(getGarmentDirectoryTag(), "max")
  revalidateTag(getCalculatorReferenceTag(), "max")
  revalidateTag(getUkTradeGarmentsTag(), "max")
  revalidatePath("/hub/garments")
  revalidatePath("/hub/calculators/eu/standard")
  revalidatePath("/hub/calculators/eu/us-clients")
  revalidatePath("/hub/calculators/uk/trade")
}

export async function deleteGarment(id: string) {
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Missing garment id")
  }

  await prisma.garment.delete({
    where: { id }
  })

  revalidateTag(getGarmentDirectoryTag(), "max")
  revalidateTag(getCalculatorReferenceTag(), "max")
  revalidateTag(getUkTradeGarmentsTag(), "max")
  revalidatePath("/hub/garments")
  revalidatePath("/hub/calculators/eu/standard")
  revalidatePath("/hub/calculators/eu/us-clients")
  revalidatePath("/hub/calculators/uk/trade")
}
