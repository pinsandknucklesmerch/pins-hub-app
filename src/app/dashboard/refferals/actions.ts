"use server"

import {
  LoyaltyTransactionType,
  ReferralStatus,
  type Prisma
} from "@prisma/client"
import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/db"
import { getRefferalsTag } from "./data"

const REFERRAL_BONUS_POINTS = 100

type ActionResult = {
  ok: boolean
  message: string
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return normalizeText(value).toLowerCase()
}

function normalizePhone(value: FormDataEntryValue | null) {
  return normalizeText(value).replace(/[^\d+]/g, "")
}

function normalizeReferralCode(value: FormDataEntryValue | null) {
  return normalizeText(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
}

function normalizeNameKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

async function revalidateRefferalsViews() {
  revalidateTag(getRefferalsTag(), "max")
  revalidatePath("/dashboard/refferals")
}

async function generateUniqueReferralCode(name: string) {
  const seed = normalizeNameKey(name).replace(/\s+/g, "").toUpperCase() || "PK"
  const prefix = seed.slice(0, 6).padEnd(6, "X")

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase()
    const referralCode = `${prefix}${suffix}`
    const existing = await prisma.customer.findUnique({
      where: { referralCode },
      select: { id: true }
    })

    if (!existing) {
      return referralCode
    }
  }

  throw new Error("Failed to generate a unique referral code. Please try again.")
}

async function resolveReferralCode(name: string, requestedCode: string) {
  if (!requestedCode) {
    return generateUniqueReferralCode(name)
  }

  const existing = await prisma.customer.findUnique({
    where: { referralCode: requestedCode },
    select: { id: true }
  })

  if (existing) {
    throw new Error(`Referral code "${requestedCode}" already exists.`)
  }

  return requestedCode
}

async function findExistingCustomerByIdentity(email: string, phone: string) {
  const orConditions: Prisma.CustomerWhereInput[] = []

  if (email) {
    orConditions.push({ email })
  }

  if (phone) {
    orConditions.push({ phone })
  }

  if (orConditions.length === 0) {
    return null
  }

  return prisma.customer.findFirst({
    where: {
      OR: orConditions
    }
  })
}

export async function createCustomer(formData: FormData): Promise<ActionResult> {
  const name = normalizeText(formData.get("name"))
  const email = normalizeEmail(formData.get("email"))
  const phone = normalizePhone(formData.get("phone"))
  const requestedCode = normalizeReferralCode(formData.get("referralCode"))

  if (!name) {
    return { ok: false, message: "Customer name is required." }
  }

  try {
    const existingCustomer = await findExistingCustomerByIdentity(email, phone)

    if (existingCustomer) {
      return {
        ok: false,
        message: "A customer with this email or phone already exists."
      }
    }

    const referralCode = await resolveReferralCode(name, requestedCode)

    await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        referralCode
      }
    })

    await revalidateRefferalsViews()

    return {
      ok: true,
      message: `Customer created with referral code ${referralCode}.`
    }
  } catch (error) {
    console.error(error)
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to create customer."
    }
  }
}

export async function createReferral(formData: FormData): Promise<ActionResult> {
  const referralCodeUsed = normalizeReferralCode(formData.get("referralCodeUsed"))
  const name = normalizeText(formData.get("name"))
  const email = normalizeEmail(formData.get("email"))
  const phone = normalizePhone(formData.get("phone"))
  const notes = normalizeText(formData.get("notes"))

  if (!referralCodeUsed) {
    return { ok: false, message: "Referral code is required." }
  }

  if (!name) {
    return { ok: false, message: "Referred customer name is required." }
  }

  try {
    const referrer = await prisma.customer.findUnique({
      where: { referralCode: referralCodeUsed },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        referralCode: true
      }
    })

    if (!referrer) {
      return { ok: false, message: "Referral code not found." }
    }

    if (email && referrer.email && email === referrer.email) {
      return { ok: false, message: "A customer cannot refer themselves." }
    }

    if (phone && referrer.phone && phone === referrer.phone) {
      return { ok: false, message: "A customer cannot refer themselves." }
    }

    if (!email && !phone && normalizeNameKey(name) === normalizeNameKey(referrer.name)) {
      return {
        ok: false,
        message: "This looks like a self-referral. Add an email or phone if it is a different customer."
      }
    }

    const existingCustomer = await findExistingCustomerByIdentity(email, phone)

    if (existingCustomer) {
      if (existingCustomer.id === referrer.id) {
        return { ok: false, message: "A customer cannot refer themselves." }
      }

      return {
        ok: false,
        message: "A customer with this email or phone already exists."
      }
    }

    const referredReferralCode = await generateUniqueReferralCode(name)

    await prisma.$transaction(async (tx) => {
      const referredCustomer = await tx.customer.create({
        data: {
          name,
          email: email || null,
          phone: phone || null,
          referralCode: referredReferralCode
        }
      })

      await tx.referral.create({
        data: {
          referrerCustomerId: referrer.id,
          referredCustomerId: referredCustomer.id,
          referralCodeUsed,
          notes: notes || null
        }
      })
    })

    await revalidateRefferalsViews()

    return {
      ok: true,
      message: `Referral logged for ${name}. New code: ${referredReferralCode}.`
    }
  } catch (error) {
    console.error(error)
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to log referral."
    }
  }
}

export async function adjustLoyaltyPoints(formData: FormData): Promise<ActionResult> {
  const customerId = normalizeText(formData.get("customerId"))
  const rawPoints = Number.parseInt(normalizeText(formData.get("pointsChange")), 10)
  const typeValue = normalizeText(formData.get("type"))
  const reason = normalizeText(formData.get("reason"))

  if (!customerId) {
    return { ok: false, message: "Customer is required." }
  }

  if (!Number.isInteger(rawPoints) || rawPoints === 0) {
    return { ok: false, message: "Enter a non-zero whole number of points." }
  }

  if (!reason) {
    return { ok: false, message: "Reason is required for loyalty changes." }
  }

  if (!Object.values(LoyaltyTransactionType).includes(typeValue as LoyaltyTransactionType)) {
    return { ok: false, message: "Invalid loyalty transaction type." }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          loyaltyPoints: true
        }
      })

      if (!customer) {
        throw new Error("Customer not found.")
      }

      const nextPoints = customer.loyaltyPoints + rawPoints

      if (nextPoints < 0) {
        throw new Error("Loyalty points cannot go below zero.")
      }

      await tx.loyaltyTransaction.create({
        data: {
          customerId,
          pointsChange: rawPoints,
          type: typeValue as LoyaltyTransactionType,
          reason
        }
      })

      await tx.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: {
            increment: rawPoints
          }
        }
      })
    })

    await revalidateRefferalsViews()

    return { ok: true, message: "Loyalty points updated." }
  } catch (error) {
    console.error(error)
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update loyalty points."
    }
  }
}

export async function updateReferralStatus(formData: FormData): Promise<ActionResult> {
  const referralId = normalizeText(formData.get("referralId"))
  const statusValue = normalizeText(formData.get("status"))

  if (!referralId) {
    return { ok: false, message: "Referral is required." }
  }

  if (!Object.values(ReferralStatus).includes(statusValue as ReferralStatus)) {
    return { ok: false, message: "Invalid referral status." }
  }

  try {
    const nextStatus = statusValue as ReferralStatus

    await prisma.$transaction(async (tx) => {
      const referral = await tx.referral.findUnique({
        where: { id: referralId },
        select: {
          id: true,
          status: true,
          referrerCustomerId: true,
          referredCustomer: {
            select: {
              name: true
            }
          },
          referrerCustomer: {
            select: {
              name: true
            }
          }
        }
      })

      if (!referral) {
        throw new Error("Referral not found.")
      }

      await tx.referral.update({
        where: { id: referralId },
        data: {
          status: nextStatus
        }
      })

      if (nextStatus === ReferralStatus.REWARDED && referral.status !== ReferralStatus.REWARDED) {
        await tx.loyaltyTransaction.create({
          data: {
            customerId: referral.referrerCustomerId,
            pointsChange: REFERRAL_BONUS_POINTS,
            type: LoyaltyTransactionType.REFERRAL_BONUS,
            reason: `Referral bonus for ${referral.referredCustomer.name}`
          }
        })

        await tx.customer.update({
          where: { id: referral.referrerCustomerId },
          data: {
            loyaltyPoints: {
              increment: REFERRAL_BONUS_POINTS
            }
          }
        })
      }
    })

    await revalidateRefferalsViews()

    return {
      ok: true,
      message:
        nextStatus === ReferralStatus.REWARDED
          ? `Referral rewarded. ${REFERRAL_BONUS_POINTS} loyalty points added.`
          : "Referral status updated."
    }
  } catch (error) {
    console.error(error)
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update referral status."
    }
  }
}

export { REFERRAL_BONUS_POINTS }
