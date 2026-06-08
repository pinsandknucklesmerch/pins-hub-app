"use client"

import { useDeferredValue, useMemo, useState, useTransition } from "react"
import type { LoyaltyTransactionType, ReferralStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  REFERRAL_BONUS_POINTS,
  adjustLoyaltyPoints,
  createCustomer,
  createReferral,
  updateReferralStatus
} from "./actions"
import type { RefferalsDashboardData } from "./data"

const REFERRAL_STATUSES: ReferralStatus[] = ["PENDING", "CONVERTED", "REWARDED", "CANCELLED"]
const LOYALTY_TYPES: LoyaltyTransactionType[] = ["ADJUSTED", "EARNED", "REDEEMED"]

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value))
}

function getReferralLink(code: string) {
  return `/ref/${code}`
}

function getSearchableText(customer: RefferalsDashboardData["customers"][number]) {
  return [customer.name, customer.email, customer.phone, customer.referralCode]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

async function copyToClipboard(text: string) {
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

export default function RefferalsClient({
  initialData
}: {
  initialData: RefferalsDashboardData
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isAddReferralOpen, setIsAddReferralOpen] = useState(false)
  const [isCustomerPending, startCustomerTransition] = useTransition()
  const [isReferralPending, startReferralTransition] = useTransition()
  const [pendingCustomerId, setPendingCustomerId] = useState<string | null>(null)
  const [pendingReferralId, setPendingReferralId] = useState<string | null>(null)

  const filteredCustomers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()

    if (!query) {
      return initialData.customers
    }

    return initialData.customers.filter((customer) => getSearchableText(customer).includes(query))
  }, [deferredSearch, initialData.customers])

  if (initialData.setupIssue) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-[#0b0c10] p-6 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
              Setup Required
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Refferals database tables are missing
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
              {initialData.setupIssue}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#111219] px-4 py-3 text-xs text-zinc-500">
            Page rendering is blocked gracefully until the migration is applied.
          </div>
        </div>
      </div>
    )
  }

  async function handleCreateCustomer(formData: FormData) {
    const result = await createCustomer(formData)

    if (!result.ok) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    setIsAddCustomerOpen(false)
    router.refresh()
  }

  async function handleCreateReferral(formData: FormData) {
    const result = await createReferral(formData)

    if (!result.ok) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    setIsAddReferralOpen(false)
    router.refresh()
  }

  async function handleAdjustPoints(customerId: string, formData: FormData) {
    setPendingCustomerId(customerId)
    const result = await adjustLoyaltyPoints(formData)
    setPendingCustomerId(null)

    if (!result.ok) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    router.refresh()
  }

  async function handleUpdateReferralStatus(referralId: string, formData: FormData) {
    setPendingReferralId(referralId)
    const result = await updateReferralStatus(formData)
    setPendingReferralId(null)

    if (!result.ok) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Customers</p>
          <p className="mt-3 text-3xl font-black text-white">{initialData.overview.customers}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Total Referrals</p>
          <p className="mt-3 text-3xl font-black text-white">{initialData.overview.totalReferrals}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Pending</p>
          <p className="mt-3 text-3xl font-black text-amber-300">
            {initialData.overview.statusOverview.PENDING}
          </p>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(239,68,68,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400/80">Rewarded</p>
          <p className="mt-3 text-3xl font-black text-red-300">
            {initialData.overview.statusOverview.REWARDED}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Rewarding adds {REFERRAL_BONUS_POINTS} points to the referrer.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
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
              placeholder="Search by customer, email, phone, or referral code..."
              className="w-full rounded-xl border border-zinc-800 bg-[#111219] py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsAddReferralOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-600/10 px-5 py-3 text-sm font-semibold text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-600/20"
            >
              Log Referral
            </button>
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-[#111219] px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-[#171922]"
            >
              Add Customer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
        <div className="space-y-5">
          {filteredCustomers.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-8 text-center text-zinc-500">
              No customers found for &quot;{search}&quot;.
            </div>
          ) : (
            filteredCustomers.map((customer) => {
              const statusCounts = {
                PENDING: 0,
                CONVERTED: 0,
                REWARDED: 0,
                CANCELLED: 0
              }

              for (const referral of customer.referralsMade) {
                statusCounts[referral.status] += 1
              }

              return (
                <div
                  key={customer.id}
                  className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold tracking-tight text-white">
                            {customer.name}
                          </h2>
                          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-red-300">
                            {customer.referralCode}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400">
                          <span>{customer.email || "No email"}</span>
                          <span>{customer.phone || "No phone"}</span>
                          <span>Added {formatDate(customer.createdAt)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
                        <div className="rounded-xl border border-zinc-800 bg-[#111219] px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            Referrals
                          </p>
                          <p className="mt-2 text-2xl font-black text-white">
                            {customer._count.referralsMade}
                          </p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-[#111219] px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            Loyalty Points
                          </p>
                          <p className="mt-2 text-2xl font-black text-red-300">
                            {customer.loyaltyPoints}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                      <div className="rounded-2xl border border-zinc-800 bg-[#0f1016] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                              Referral Link
                            </p>
                            <p className="mt-2 break-all font-mono text-sm text-zinc-200">
                              {getReferralLink(customer.referralCode)}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                              type="button"
                              onClick={async () => {
                                await copyToClipboard(getReferralLink(customer.referralCode))
                                toast.success("Referral link copied.")
                              }}
                              className="rounded-lg border border-zinc-700 bg-[#111219] px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-600"
                            >
                              Copy Link
                            </button>
                            <button
                              type="button"
                              disabled
                              className="rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-300/70"
                            >
                              QR Soon
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                          {REFERRAL_STATUSES.map((status) => (
                            <div
                              key={status}
                              className="rounded-xl border border-zinc-800 bg-[#111219] px-3 py-3"
                            >
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                {status}
                              </p>
                              <p className="mt-2 text-xl font-black text-white">
                                {statusCounts[status]}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-[#0f1016] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                          Manual Loyalty Adjustment
                        </p>
                        <form
                          className="mt-4 space-y-3"
                          onSubmit={(event) => {
                            event.preventDefault()
                            const formData = new FormData(event.currentTarget)

                            startCustomerTransition(() => {
                              void handleAdjustPoints(customer.id, formData)
                            })
                          }}
                        >
                          <input type="hidden" name="customerId" value={customer.id} />
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                            <input
                              required
                              name="pointsChange"
                              type="number"
                              step="1"
                              placeholder="+100 or -50"
                              className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                            />
                            <select
                              name="type"
                              defaultValue="ADJUSTED"
                              className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                            >
                              {LOYALTY_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input
                            required
                            name="reason"
                            type="text"
                            placeholder="Reason for points change"
                            className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                          />
                          <button
                            type="submit"
                            disabled={isCustomerPending && pendingCustomerId === customer.id}
                            className="rounded-lg border border-red-500/20 bg-red-600/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isCustomerPending && pendingCustomerId === customer.id
                              ? "Saving..."
                              : "Update Points"}
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <div className="rounded-2xl border border-zinc-800 bg-[#0f1016] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                          Recent Referrals
                        </p>
                        <div className="mt-4 space-y-3">
                          {customer.referralsMade.length === 0 ? (
                            <p className="text-sm text-zinc-500">No referrals logged yet.</p>
                          ) : (
                            customer.referralsMade.slice(0, 4).map((referral) => (
                              <div
                                key={referral.id}
                                className="rounded-xl border border-zinc-800 bg-[#111219] p-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-semibold text-white">
                                      {referral.referredCustomer.name}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                      Used {referral.referralCodeUsed} on {formatDate(referral.createdAt)}
                                    </p>
                                  </div>
                                  <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">
                                    {referral.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-[#0f1016] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                          Recent Loyalty Log
                        </p>
                        <div className="mt-4 space-y-3">
                          {customer.loyaltyTransactions.length === 0 ? (
                            <p className="text-sm text-zinc-500">No loyalty activity yet.</p>
                          ) : (
                            customer.loyaltyTransactions.map((transaction) => (
                              <div
                                key={transaction.id}
                                className="rounded-xl border border-zinc-800 bg-[#111219] p-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-semibold text-white">{transaction.reason}</p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                      {transaction.type} on {formatDate(transaction.createdAt)}
                                    </p>
                                  </div>
                                  <span className="font-mono text-sm font-bold text-red-300">
                                    {transaction.pointsChange > 0 ? "+" : ""}
                                    {transaction.pointsChange}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Referral Status Overview
            </p>
            <div className="mt-4 space-y-3">
              {REFERRAL_STATUSES.map((status) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#111219] px-4 py-3 text-sm"
                >
                  <span className="font-medium text-zinc-300">{status}</span>
                  <span className="font-mono text-white">
                    {initialData.overview.statusOverview[status]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Recent Referral Activity
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Update statuses here. Rewarding adds the bonus automatically.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {initialData.recentReferrals.length === 0 ? (
                <p className="text-sm text-zinc-500">No referrals logged yet.</p>
              ) : (
                initialData.recentReferrals.map((referral) => (
                  <form
                    key={referral.id}
                    className="rounded-xl border border-zinc-800 bg-[#111219] p-4"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const formData = new FormData(event.currentTarget)

                      startReferralTransition(() => {
                        void handleUpdateReferralStatus(referral.id, formData)
                      })
                    }}
                  >
                    <input type="hidden" name="referralId" value={referral.id} />
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {referral.referrerCustomer.name} referred {referral.referredCustomer.name}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Code {referral.referralCodeUsed} · {formatDate(referral.createdAt)}
                        </p>
                        {referral.notes ? (
                          <p className="mt-2 text-sm text-zinc-400">{referral.notes}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                          name="status"
                          defaultValue={referral.status}
                          className="w-full rounded-lg border border-zinc-800 bg-[#0b0c10] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                        >
                          {REFERRAL_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={isReferralPending && pendingReferralId === referral.id}
                          className="rounded-lg border border-red-500/20 bg-red-600/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isReferralPending && pendingReferralId === referral.id
                            ? "Saving..."
                            : "Save Status"}
                        </button>
                      </div>
                    </div>
                  </form>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {isAddCustomerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#0b0c10] p-6 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Add Customer</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Create a customer and reserve a referral code now.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="text-zinc-500 transition-colors hover:text-white"
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
            <form
              className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault()
                const formData = new FormData(event.currentTarget)

                startCustomerTransition(() => {
                  void handleCreateCustomer(formData)
                })
              }}
            >
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-400">Name</label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Email</label>
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Phone</label>
                <input
                  name="phone"
                  type="text"
                  className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-400">
                  Referral Code
                </label>
                <input
                  name="referralCode"
                  type="text"
                  placeholder="Optional. Leave blank to auto-generate."
                  className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 uppercase text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="rounded-lg border border-zinc-700 bg-[#111219] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCustomerPending}
                  className="rounded-lg border border-red-500/20 bg-red-600/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCustomerPending ? "Saving..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isAddReferralOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#0b0c10] p-6 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Log Referral</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Use an existing referral code and create the referred customer in one step.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddReferralOpen(false)}
                className="text-zinc-500 transition-colors hover:text-white"
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
            <form
              className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault()
                const formData = new FormData(event.currentTarget)

                startReferralTransition(() => {
                  void handleCreateReferral(formData)
                })
              }}
            >
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-400">
                  Referral Code Used
                </label>
                <input
                  required
                  name="referralCodeUsed"
                  type="text"
                  placeholder="e.g. GERMAN1"
                  className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 uppercase text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-400">
                  Referred Customer Name
                </label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Email</label>
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Phone</label>
                <input
                  name="phone"
                  type="text"
                  className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-400">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Optional context for sales follow-up"
                  className="w-full rounded-lg border border-zinc-800 bg-[#111219] px-3 py-2.5 text-white outline-none transition-shadow focus:border-red-500/40 focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddReferralOpen(false)}
                  className="rounded-lg border border-zinc-700 bg-[#111219] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReferralPending}
                  className="rounded-lg border border-red-500/20 bg-red-600/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isReferralPending ? "Saving..." : "Create Referral"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
