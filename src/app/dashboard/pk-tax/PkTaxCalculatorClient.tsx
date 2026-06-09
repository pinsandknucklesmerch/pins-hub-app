"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

export type AccountManagerEligibility =
  | "eligible_pool_recipient"
  | "contribution_only_pool_included"
  | "johan_separate"
  | "excluded"

type AccountManagerCode = "bux" | "hardus" | "justin" | "seth" | "shannon" | "johan"

export type AccountManagerMonthlyInput = {
  id: number
  code?: AccountManagerCode
  name: string
  eligibility: AccountManagerEligibility
  companyProfit: string
  snuggleProfit: string
  pkTax: string
  orders: string
  removable: boolean
}

export type AccountManagerResult = {
  id: number
  name: string
  eligibility: AccountManagerEligibility
  companyProfitShare: number
  snuggleProfitShare: number
  pkTaxShare: number
  ordersShare: number
  weightedScore: number
  initialSharedPoolShareGbp: number
  redistributedAdjustmentGbp: number
  finalSharedPoolPayoutGbp: number
  separatePkTaxPayoutGbp: number
  totalGbp: number
  totalZar: number
}

type MetricTotals = {
  companyProfit: number
  snuggleProfit: number
  pkTax: number
  orders: number
}

type PoolBreakdown = {
  exchangeRate: number
  totalCompanyProfitUsed: number
  totalSnuggleProfitUsed: number
  totalPkTaxUsed: number
  totalOrdersUsed: number
  sharedPoolPkTaxBase: number
  sharedPoolPkTaxContribution: number
  totalIncludedSnuggleProfit: number
  snugglePoolContribution: number
  totalSharedSalesTeamPool: number
  totalNetsuitePkTax: number
  epccRetained: number
  adminBankFees: number
  marketing: number
  operations: number
  johanPkTax: number
  johanSeparatePayout: number
  totalWeightedScore: number
  eligibleWeightedScoreTotal: number
  totalInitialNonRecipientShare: number
  totalRedistributedAmount: number
  totalFinalSharedPoolPayoutGbp: number
  totalSeparateJohanPayoutGbp: number
  totalPayableGbp: number
  totalPayableZar: number
  remainingDifference: number
}

type AccordionSectionProps = {
  title: string
  description?: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

const COMPANY_PROFIT_WEIGHT = 0.4
const SNUGGLE_PROFIT_WEIGHT = 0.25
const PK_TAX_WEIGHT = 0.2
const ORDERS_WEIGHT = 0.15
const DEFAULT_EXCHANGE_RATE = "21"

const ELIGIBILITY_LABELS: Record<AccountManagerEligibility, string> = {
  eligible_pool_recipient: "Pool recipient",
  contribution_only_pool_included: "Contribution only — PK Tax included in pool",
  johan_separate: "Johan separate — 40% own PK Tax",
  excluded: "Excluded",
}

const ALLOCATION_RULES = [
  "Contribution percentages include Bux, Hardus, Justin, Seth, Shannon, and Johan.",
  "The shared sales team pool is made from 40% of PK Tax from Bux, Hardus, Justin, Seth, and Shannon.",
  "Johan’s PK Tax is kept separate.",
  "Johan receives 40% of his own PK Tax.",
  "7% of Snuggle profit is added to the shared pool.",
  "Only Bux, Hardus, Justin, and Seth split the shared pool.",
  "Shannon and Johan’s calculated shared-pool shares are redistributed across eligible sales team members.",
  "EPCC, Admin, Marketing, and Operations allocations are calculated from total Netsuite PK Tax, not from the Snuggle pool.",
] as const

const REPORT_SOURCES = [
  {
    title: "Netsuite PK Tax Report",
    description:
      "Enter PK Tax per person. Shannon and Johan are included in PK Tax contribution percentages. Johan is paid separately at 40%, while Shannon’s PK Tax is included in the shared pool.",
  },
  {
    title: "Netsuite Profit Report",
    description: "Enter normal company profit per person, excluding PK Tax.",
  },
  {
    title: "Snuggle Report",
    description:
      "Enter Snuggle profit per person. Shannon’s tour jobs should already be excluded before entry.",
  },
  {
    title: "Netsuite Order Snapshot",
    description: "Enter number of orders processed per person.",
  },
] as const

const CHECKS_GUIDE = [
  "Total final shared pool payout to Bux, Hardus, Justin, and Seth should equal the total shared sales team pool, allowing for small rounding differences.",
  "Johan’s separate payout is excluded from the shared pool payout check.",
  "If all four metric totals are above zero, total weighted score for included contributors should equal 100%.",
  "If one or more metric totals are zero, that metric weighting cannot be distributed.",
] as const

function AccordionSection({
  title,
  description,
  isOpen,
  onToggle,
  children,
}: AccordionSectionProps) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#0b0c10]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-[#111219]"
        aria-expanded={isOpen}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">{title}</p>
          {description ? <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p> : null}
        </div>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen ? <div className="border-t border-zinc-800 px-6 py-6">{children}</div> : null}
    </section>
  )
}

function createDefaultRows(): AccountManagerMonthlyInput[] {
  return [
    createRow(1, "Bux", "eligible_pool_recipient", false, "bux"),
    createRow(2, "Hardus", "eligible_pool_recipient", false, "hardus"),
    createRow(3, "Justin", "eligible_pool_recipient", false, "justin"),
    createRow(4, "Seth", "eligible_pool_recipient", false, "seth"),
    createRow(5, "Shannon", "contribution_only_pool_included", false, "shannon"),
    createRow(6, "Johan", "johan_separate", false, "johan"),
  ]
}

function createRow(
  id: number,
  name = "",
  eligibility: AccountManagerEligibility = "excluded",
  removable = true,
  code?: AccountManagerCode
): AccountManagerMonthlyInput {
  return {
    id,
    code,
    name,
    eligibility,
    companyProfit: "",
    snuggleProfit: "",
    pkTax: "",
    orders: "",
    removable,
  }
}

function parseCurrencyInput(value: string) {
  if (!value.trim()) return 0
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return parsed
}

function parseOrdersInput(value: string) {
  if (!value.trim()) return 0
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return parsed
}

function clampNumberInput(value: string, wholeNumber = false) {
  if (!value.trim()) return ""
  const parsed = wholeNumber ? Number.parseInt(value, 10) : Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return ""
  return String(Math.max(0, wholeNumber ? Math.trunc(parsed) : parsed))
}

function getShare(value: number, total: number) {
  if (total <= 0) return 0
  return value / total
}

function formatCurrencyGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCurrencyZar(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`
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

function getInputClassName() {
  return "w-full rounded-xl border border-zinc-800 bg-[#12131a] px-3 py-2.5 outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20"
}

function isIncludedRow(row: AccountManagerMonthlyInput) {
  return row.eligibility !== "excluded"
}

function isEligiblePoolRecipient(row: AccountManagerMonthlyInput | AccountManagerResult) {
  return row.eligibility === "eligible_pool_recipient"
}

function isContributionOnlyPoolIncluded(row: AccountManagerMonthlyInput | AccountManagerResult) {
  return row.eligibility === "contribution_only_pool_included"
}

function isJohanSeparate(row: AccountManagerMonthlyInput | AccountManagerResult) {
  return row.eligibility === "johan_separate"
}

function isSharedPoolBaseRow(row: AccountManagerMonthlyInput) {
  return isEligiblePoolRecipient(row) || isContributionOnlyPoolIncluded(row)
}

function isNonRecipientRow(row: AccountManagerResult) {
  return isContributionOnlyPoolIncluded(row) || isJohanSeparate(row)
}

export default function PkTaxCalculatorClient() {
  const [monthLabel, setMonthLabel] = useState("")
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE)
  const [defaultCompanyProfit, setDefaultCompanyProfit] = useState("")
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isInputsOpen, setIsInputsOpen] = useState(false)
  const [isResultsOpen, setIsResultsOpen] = useState(false)
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false)
  const [isTotalsOpen, setIsTotalsOpen] = useState(false)
  const [isFactoryInvoiceOpen, setIsFactoryInvoiceOpen] = useState(false)
  const [rows, setRows] = useState<AccountManagerMonthlyInput[]>(createDefaultRows())
  const [nextRowId, setNextRowId] = useState(7)

  const guideTitleId = useId()
  const guideDialogRef = useRef<HTMLDivElement>(null)
  const guideTriggerRef = useRef<HTMLButtonElement>(null)

  const exchangeRateValue = parseCurrencyInput(exchangeRate) || 21
  const includedRows = useMemo(() => rows.filter(isIncludedRow), [rows])
  const sharedPoolBaseRows = useMemo(() => includedRows.filter(isSharedPoolBaseRow), [includedRows])

  useEffect(() => {
    if (!isGuideOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const triggerElement = guideTriggerRef.current
    document.body.style.overflow = "hidden"

    const getFocusableElements = () => {
      const dialog = guideDialogRef.current
      if (!dialog) return []

      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true")
    }

    getFocusableElements()[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setIsGuideOpen(false)
        return
      }

      if (event.key !== "Tab") return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      triggerElement?.focus()
    }
  }, [isGuideOpen])

  const totals = useMemo<MetricTotals>(
    () =>
      includedRows.reduce<MetricTotals>(
        (accumulator, row) => {
          accumulator.companyProfit += parseCurrencyInput(row.companyProfit)
          accumulator.snuggleProfit += parseCurrencyInput(row.snuggleProfit)
          accumulator.pkTax += parseCurrencyInput(row.pkTax)
          accumulator.orders += parseOrdersInput(row.orders)
          return accumulator
        },
        { companyProfit: 0, snuggleProfit: 0, pkTax: 0, orders: 0 }
      ),
    [includedRows]
  )

  const sharedPoolPkTaxBase = useMemo(
    () => sharedPoolBaseRows.reduce((sum, row) => sum + parseCurrencyInput(row.pkTax), 0),
    [sharedPoolBaseRows]
  )

  const johanPkTax = useMemo(
    () =>
      includedRows.reduce((sum, row) => {
        if (!isJohanSeparate(row)) return sum
        return sum + parseCurrencyInput(row.pkTax)
      }, 0),
    [includedRows]
  )

  const breakdownBase = useMemo(() => {
    const sharedPoolPkTaxContribution = sharedPoolPkTaxBase * 0.4
    const snugglePoolContribution = totals.snuggleProfit * 0.07
    const totalSharedSalesTeamPool = sharedPoolPkTaxContribution + snugglePoolContribution

    return {
      sharedPoolPkTaxContribution,
      snugglePoolContribution,
      totalSharedSalesTeamPool,
      epccRetained: totals.pkTax * 0.4,
      adminBankFees: totals.pkTax * 0.1,
      marketing: totals.pkTax * 0.05,
      operations: totals.pkTax * 0.05,
      johanSeparatePayout: johanPkTax * 0.4,
    }
  }, [johanPkTax, sharedPoolPkTaxBase, totals.pkTax, totals.snuggleProfit])

  const results = useMemo<AccountManagerResult[]>(() => {
    const baseResults = includedRows.map<AccountManagerResult>((row) => {
      const companyProfitValue = parseCurrencyInput(row.companyProfit)
      const snuggleProfitValue = parseCurrencyInput(row.snuggleProfit)
      const pkTaxValue = parseCurrencyInput(row.pkTax)
      const ordersValue = parseOrdersInput(row.orders)

      const companyProfitShare = getShare(companyProfitValue, totals.companyProfit)
      const snuggleProfitShare = getShare(snuggleProfitValue, totals.snuggleProfit)
      const pkTaxShare = getShare(pkTaxValue, totals.pkTax)
      const ordersShare = getShare(ordersValue, totals.orders)

      const weightedScore =
        companyProfitShare * COMPANY_PROFIT_WEIGHT +
        snuggleProfitShare * SNUGGLE_PROFIT_WEIGHT +
        pkTaxShare * PK_TAX_WEIGHT +
        ordersShare * ORDERS_WEIGHT

      const initialSharedPoolShareGbp = breakdownBase.totalSharedSalesTeamPool * weightedScore
      const separatePkTaxPayoutGbp = isJohanSeparate(row) ? pkTaxValue * 0.4 : 0

      return {
        id: row.id,
        name: row.name || `Row ${row.id}`,
        eligibility: row.eligibility,
        companyProfitShare,
        snuggleProfitShare,
        pkTaxShare,
        ordersShare,
        weightedScore,
        initialSharedPoolShareGbp,
        redistributedAdjustmentGbp: 0,
        finalSharedPoolPayoutGbp: 0,
        separatePkTaxPayoutGbp,
        totalGbp: separatePkTaxPayoutGbp,
        totalZar: separatePkTaxPayoutGbp * exchangeRateValue,
      }
    })

    const eligibleWeightedScoreTotal = baseResults
      .filter(isEligiblePoolRecipient)
      .reduce((sum, row) => sum + row.weightedScore, 0)

    const nonRecipientInitialShareTotal = baseResults
      .filter(isNonRecipientRow)
      .reduce((sum, row) => sum + row.initialSharedPoolShareGbp, 0)

    return baseResults.map((row) => {
      if (!isEligiblePoolRecipient(row)) {
        const totalGbp = row.separatePkTaxPayoutGbp
        return {
          ...row,
          redistributedAdjustmentGbp: 0,
          finalSharedPoolPayoutGbp: 0,
          totalGbp,
          totalZar: totalGbp * exchangeRateValue,
        }
      }

      const redistributionShare = getShare(row.weightedScore, eligibleWeightedScoreTotal)
      const redistributedAdjustmentGbp =
        eligibleWeightedScoreTotal > 0 ? nonRecipientInitialShareTotal * redistributionShare : 0
      const finalSharedPoolPayoutGbp = row.initialSharedPoolShareGbp + redistributedAdjustmentGbp
      const totalGbp = finalSharedPoolPayoutGbp

      return {
        ...row,
        redistributedAdjustmentGbp,
        finalSharedPoolPayoutGbp,
        totalGbp,
        totalZar: totalGbp * exchangeRateValue,
      }
    })
  }, [breakdownBase.totalSharedSalesTeamPool, exchangeRateValue, includedRows, totals])

  const breakdown = useMemo<PoolBreakdown>(() => {
    const totalWeightedScore = results.reduce((sum, row) => sum + row.weightedScore, 0)
    const eligibleWeightedScoreTotal = results
      .filter(isEligiblePoolRecipient)
      .reduce((sum, row) => sum + row.weightedScore, 0)
    const totalInitialNonRecipientShare = results
      .filter(isNonRecipientRow)
      .reduce((sum, row) => sum + row.initialSharedPoolShareGbp, 0)
    const totalRedistributedAmount = results
      .filter(isEligiblePoolRecipient)
      .reduce((sum, row) => sum + row.redistributedAdjustmentGbp, 0)
    const totalFinalSharedPoolPayoutGbp = results
      .filter(isEligiblePoolRecipient)
      .reduce((sum, row) => sum + row.finalSharedPoolPayoutGbp, 0)
    const totalSeparateJohanPayoutGbp = results
      .filter(isJohanSeparate)
      .reduce((sum, row) => sum + row.separatePkTaxPayoutGbp, 0)
    const totalPayableGbp = totalFinalSharedPoolPayoutGbp + totalSeparateJohanPayoutGbp

    return {
      exchangeRate: exchangeRateValue,
      totalCompanyProfitUsed: totals.companyProfit,
      totalSnuggleProfitUsed: totals.snuggleProfit,
      totalPkTaxUsed: totals.pkTax,
      totalOrdersUsed: totals.orders,
      sharedPoolPkTaxBase,
      sharedPoolPkTaxContribution: breakdownBase.sharedPoolPkTaxContribution,
      totalIncludedSnuggleProfit: totals.snuggleProfit,
      snugglePoolContribution: breakdownBase.snugglePoolContribution,
      totalSharedSalesTeamPool: breakdownBase.totalSharedSalesTeamPool,
      totalNetsuitePkTax: totals.pkTax,
      epccRetained: breakdownBase.epccRetained,
      adminBankFees: breakdownBase.adminBankFees,
      marketing: breakdownBase.marketing,
      operations: breakdownBase.operations,
      johanPkTax,
      johanSeparatePayout: breakdownBase.johanSeparatePayout,
      totalWeightedScore,
      eligibleWeightedScoreTotal,
      totalInitialNonRecipientShare,
      totalRedistributedAmount,
      totalFinalSharedPoolPayoutGbp,
      totalSeparateJohanPayoutGbp,
      totalPayableGbp,
      totalPayableZar: totalPayableGbp * exchangeRateValue,
      remainingDifference: breakdownBase.totalSharedSalesTeamPool - totalFinalSharedPoolPayoutGbp,
    }
  }, [breakdownBase, exchangeRateValue, johanPkTax, results, sharedPoolPkTaxBase, totals])

  const hasZeroMetricTotal =
    totals.companyProfit === 0 || totals.snuggleProfit === 0 || totals.pkTax === 0 || totals.orders === 0
  const noEligibleWeightedScore =
    breakdown.eligibleWeightedScoreTotal <= 0 && breakdown.totalSharedSalesTeamPool > 0
  const factoryPkTaxPortion = breakdown.totalNetsuitePkTax * 0.4
  const factoryAdminFees = breakdown.totalNetsuitePkTax * 0.1
  const factoryMarketing = breakdown.totalNetsuitePkTax * 0.05
  const factoryOperations = breakdown.totalNetsuitePkTax * 0.05
  const factoryInvoiceTotal = breakdown.totalNetsuitePkTax * 0.6

  function updateRow(id: number, field: keyof AccountManagerMonthlyInput, value: string) {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== id) return row

        if (field === "companyProfit" || field === "snuggleProfit" || field === "pkTax") {
          return { ...row, [field]: clampNumberInput(value) }
        }

        if (field === "orders") {
          return { ...row, [field]: clampNumberInput(value, true) }
        }

        return { ...row, [field]: value }
      })
    )
  }

  function applyCompanyProfitToAll() {
    const appliedValue = clampNumberInput(defaultCompanyProfit) || "0"
    setRows((currentRows) =>
      currentRows.map((row) => (row.eligibility === "excluded" ? row : { ...row, companyProfit: appliedValue }))
    )
    toast.success("Company profit applied to all non-excluded rows.")
  }

  function addRow() {
    setRows((currentRows) => [...currentRows, createRow(nextRowId)])
    setNextRowId((currentId) => currentId + 1)
  }

  function removeRow(id: number) {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id))
  }

  function resetCalculator() {
    setMonthLabel("")
    setExchangeRate(DEFAULT_EXCHANGE_RATE)
    setDefaultCompanyProfit("")
    setRows(createDefaultRows())
    setNextRowId(7)
    toast.success("PK Tax calculator reset.")
  }

  async function handleCopySummary() {
    const summaryLines = [
      `PK Tax Calculator Summary${monthLabel.trim() ? ` - ${monthLabel.trim()}` : ""}`,
      `Exchange Rate: £1 = R${breakdown.exchangeRate.toFixed(2)}`,
      "",
      "Netsuite PK Tax Allocation:",
      `- Total Netsuite PK Tax: ${formatCurrencyGbp(breakdown.totalNetsuitePkTax)}`,
      `- EPCC retained (40%): ${formatCurrencyGbp(breakdown.epccRetained)}`,
      `- Admin / bank fees (10%): ${formatCurrencyGbp(breakdown.adminBankFees)}`,
      `- Marketing (5%): ${formatCurrencyGbp(breakdown.marketing)}`,
      `- Operations (5%): ${formatCurrencyGbp(breakdown.operations)}`,
      `- Shared pool PK Tax base: ${formatCurrencyGbp(breakdown.sharedPoolPkTaxBase)}`,
      `- Shared pool PK Tax contribution (40%): ${formatCurrencyGbp(breakdown.sharedPoolPkTaxContribution)}`,
      `- Snuggle profit total: ${formatCurrencyGbp(breakdown.totalIncludedSnuggleProfit)}`,
      `- Snuggle pool contribution (7%): ${formatCurrencyGbp(breakdown.snugglePoolContribution)}`,
      `- Total shared sales team pool: ${formatCurrencyGbp(breakdown.totalSharedSalesTeamPool)}`,
      `- Johan PK Tax: ${formatCurrencyGbp(breakdown.johanPkTax)}`,
      `- Johan separate payout (40%): ${formatCurrencyGbp(breakdown.johanSeparatePayout)}`,
      "",
      "Weighted Contribution Scores:",
      ...results.map(
        (row) => `- ${row.name}: ${formatPercent(row.weightedScore)} (${ELIGIBILITY_LABELS[row.eligibility]})`
      ),
      "",
      "Final Payouts:",
      ...results
        .filter((row) => isEligiblePoolRecipient(row) || isJohanSeparate(row))
        .map((row) => {
          if (isJohanSeparate(row)) {
            return `- ${row.name}: separate payout ${formatCurrencyGbp(row.separatePkTaxPayoutGbp)} / ${formatCurrencyZar(row.totalZar)}`
          }

          return `- ${row.name}: shared pool ${formatCurrencyGbp(row.finalSharedPoolPayoutGbp)} / ${formatCurrencyZar(row.totalZar)}`
        }),
      "",
      `Total redistributed amount: ${formatCurrencyGbp(breakdown.totalRedistributedAmount)}`,
      `Total payable GBP: ${formatCurrencyGbp(breakdown.totalPayableGbp)}`,
      `Total payable ZAR: ${formatCurrencyZar(breakdown.totalPayableZar)}`,
    ]

    try {
      await copyToClipboard(summaryLines.join("\n"))
      toast.success("PK Tax summary copied.")
    } catch {
      toast.error("Failed to copy PK Tax summary.")
    }
  }

  async function handleCopyFactoryInvoiceTotal() {
    try {
      await copyToClipboard(formatCurrencyGbp(factoryInvoiceTotal))
      toast.success("Factory invoice total copied.")
    } catch {
      toast.error("Failed to copy factory invoice total.")
    }
  }

  const inputClassName = getInputClassName()

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-800 bg-[#0b0c10] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">Month Setup</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Set the month, exchange rate, and optional bulk company profit value. The guide
              button contains the allocation notes, report-source reminders, and payout checks.
            </p>
          </div>

          <button
            ref={guideTriggerRef}
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-800 bg-[#101116] px-3 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-300"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 text-[11px] text-red-400">
              i
            </span>
            PK Tax Guide
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Month</span>
            <input
              type="text"
              value={monthLabel}
              onChange={(event) => setMonthLabel(event.target.value)}
              placeholder="e.g. May 2026"
              className={inputClassName}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-300">Exchange rate</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={exchangeRate}
              onChange={(event) => setExchangeRate(clampNumberInput(event.target.value))}
              className={inputClassName}
            />
            <span className="block text-xs text-zinc-500">Default: £1 = R21</span>
          </label>

          <div className="space-y-2">
            <span className="text-sm text-zinc-300">Apply company profit to all rows</span>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="number"
                min="0"
                step="0.01"
                value={defaultCompanyProfit}
                onChange={(event) => setDefaultCompanyProfit(clampNumberInput(event.target.value))}
                placeholder="Default company profit"
                className={inputClassName}
              />
              <button
                type="button"
                onClick={applyCompanyProfitToAll}
                className="shrink-0 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:border-red-500/50 hover:bg-red-500/15"
              >
                Apply to all
              </button>
            </div>
            <p className="text-xs leading-5 text-zinc-500">
              Use this when the same company profit value applies to all account managers. You can
              still edit individual rows afterwards.
            </p>
          </div>
        </div>
      </section>

      <AccordionSection
        title="Account Manager Inputs"
        description="Default rows are set up for Bux, Hardus, Justin, Seth, Shannon, and Johan. Expand this section when you need to edit or add manual-entry rows."
        isOpen={isInputsOpen}
        onToggle={() => setIsInputsOpen((current) => !current)}
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addRow}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-500/50 hover:bg-red-500/15"
          >
            Add Row
          </button>
          <button
            type="button"
            onClick={resetCalculator}
            className="rounded-xl border border-zinc-700 bg-[#12131a] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Reset
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Eligibility</th>
                <th className="px-3 py-2">Company Profit</th>
                <th className="px-3 py-2">Snuggle Profit</th>
                <th className="px-3 py-2">PK Tax</th>
                <th className="px-3 py-2">Orders</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="rounded-2xl bg-[#12131a] text-zinc-200">
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(event) => updateRow(row.id, "name", event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={row.eligibility}
                      onChange={(event) =>
                        updateRow(row.id, "eligibility", event.target.value as AccountManagerEligibility)
                      }
                      className={inputClassName}
                    >
                      {Object.entries(ELIGIBILITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.companyProfit}
                      onChange={(event) => updateRow(row.id, "companyProfit", event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.snuggleProfit}
                      onChange={(event) => updateRow(row.id, "snuggleProfit", event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.pkTax}
                      onChange={(event) => updateRow(row.id, "pkTax", event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.orders}
                      onChange={(event) => updateRow(row.id, "orders", event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-3 py-3">
                    {row.removable ? (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-red-500/40 hover:text-red-200"
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">Default row</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Results"
        description="Expand to view all weighted contribution percentages, shared-pool allocations, separate Johan payout values, and copy-ready summary outputs."
        isOpen={isResultsOpen}
        onToggle={() => setIsResultsOpen((current) => !current)}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm leading-6 text-zinc-400">
            All included rows are shown below. Shannon and Johan stay in the weighted score
            calculation, but only Bux, Hardus, Justin, and Seth receive shared-pool payouts.
          </p>

          <button
            type="button"
            onClick={handleCopySummary}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-500/50 hover:bg-red-500/15"
          >
            Copy Summary
          </button>
        </div>

        {hasZeroMetricTotal ? (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-100/90">
            One or more report totals are zero, so that metric weighting cannot be distributed.
          </div>
        ) : null}

        {noEligibleWeightedScore ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-100/90">
            No eligible weighted score exists to distribute the pool.
          </div>
        ) : null}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Eligibility</th>
                <th className="px-3 py-2">Company Profit %</th>
                <th className="px-3 py-2">Snuggle Profit %</th>
                <th className="px-3 py-2">PK Tax %</th>
                <th className="px-3 py-2">Orders %</th>
                <th className="px-3 py-2">Weighted Score %</th>
                <th className="px-3 py-2">Initial Shared Pool Share GBP</th>
                <th className="px-3 py-2">Redistributed Adjustment GBP</th>
                <th className="px-3 py-2">Final Shared Pool Payout GBP</th>
                <th className="px-3 py-2">Separate PK Tax Payout GBP</th>
                <th className="px-3 py-2">Total GBP</th>
                <th className="px-3 py-2">Total ZAR</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.id} className="rounded-2xl bg-[#12131a] text-zinc-200">
                  <td className="px-3 py-3">{row.name}</td>
                  <td className="px-3 py-3 text-zinc-300">{ELIGIBILITY_LABELS[row.eligibility]}</td>
                  <td className="px-3 py-3">{formatPercent(row.companyProfitShare)}</td>
                  <td className="px-3 py-3">{formatPercent(row.snuggleProfitShare)}</td>
                  <td className="px-3 py-3">{formatPercent(row.pkTaxShare)}</td>
                  <td className="px-3 py-3">{formatPercent(row.ordersShare)}</td>
                  <td className="px-3 py-3 font-semibold text-white">{formatPercent(row.weightedScore)}</td>
                  <td className="px-3 py-3">{formatCurrencyGbp(row.initialSharedPoolShareGbp)}</td>
                  <td className="px-3 py-3">{formatCurrencyGbp(row.redistributedAdjustmentGbp)}</td>
                  <td className="px-3 py-3">{formatCurrencyGbp(row.finalSharedPoolPayoutGbp)}</td>
                  <td className="px-3 py-3">{formatCurrencyGbp(row.separatePkTaxPayoutGbp)}</td>
                  <td className="px-3 py-3 font-semibold text-white">{formatCurrencyGbp(row.totalGbp)}</td>
                  <td className="px-3 py-3">{formatCurrencyZar(row.totalZar)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Pool & Allocation Breakdown"
        description="Expand to view the three supporting breakdown cards: Netsuite PK Tax Allocation, Shared Pool Inputs, and Final Shared Pool."
        isOpen={isBreakdownOpen}
        onToggle={() => setIsBreakdownOpen((current) => !current)}
      >
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-[#12131a] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              A. Netsuite PK Tax Allocation
            </p>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Total Netsuite PK Tax</span>
                <span>{formatCurrencyGbp(breakdown.totalNetsuitePkTax)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>EPCC retained, 40% of total PK Tax</span>
                <span>{formatCurrencyGbp(breakdown.epccRetained)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Admin / bank fees, 10% of total PK Tax</span>
                <span>{formatCurrencyGbp(breakdown.adminBankFees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Marketing, 5% of total PK Tax</span>
                <span>{formatCurrencyGbp(breakdown.marketing)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Operations, 5% of total PK Tax</span>
                <span>{formatCurrencyGbp(breakdown.operations)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                <span>Johan separate PK Tax payout, 40% of Johan PK Tax</span>
                <span className="text-red-300">{formatCurrencyGbp(breakdown.johanSeparatePayout)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-[#12131a] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">B. Shared Pool Inputs</p>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Shared pool PK Tax base</span>
                <span>{formatCurrencyGbp(breakdown.sharedPoolPkTaxBase)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shared pool PK Tax contribution, 40% of base</span>
                <span>{formatCurrencyGbp(breakdown.sharedPoolPkTaxContribution)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total included Snuggle profit</span>
                <span>{formatCurrencyGbp(breakdown.totalIncludedSnuggleProfit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Snuggle pool contribution, 7% of Snuggle profit</span>
                <span>{formatCurrencyGbp(breakdown.snugglePoolContribution)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-[#12131a] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">C. Final Shared Pool</p>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Shared pool PK Tax contribution</span>
                <span>{formatCurrencyGbp(breakdown.sharedPoolPkTaxContribution)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Snuggle pool contribution</span>
                <span>{formatCurrencyGbp(breakdown.snugglePoolContribution)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                <span>Total shared sales team pool</span>
                <span className="text-red-300">{formatCurrencyGbp(breakdown.totalSharedSalesTeamPool)}</span>
              </div>
            </div>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Totals and Checks"
        description="Expand to review the calculated totals, redistribution values, weighted-score totals, and payout reconciliation checks."
        isOpen={isTotalsOpen}
        onToggle={() => setIsTotalsOpen((current) => !current)}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-[#12131a] p-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between">
              <span>Total company profit used for percentages</span>
              <span>{formatCurrencyGbp(breakdown.totalCompanyProfitUsed)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Snuggle profit used for percentages</span>
              <span>{formatCurrencyGbp(breakdown.totalSnuggleProfitUsed)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total PK Tax used for percentages</span>
              <span>{formatCurrencyGbp(breakdown.totalPkTaxUsed)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total orders used for percentages</span>
              <span>{breakdown.totalOrdersUsed.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shared pool PK Tax base</span>
              <span>{formatCurrencyGbp(breakdown.sharedPoolPkTaxBase)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shared pool PK Tax contribution at 40%</span>
              <span>{formatCurrencyGbp(breakdown.sharedPoolPkTaxContribution)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Snuggle pool contribution at 7%</span>
              <span>{formatCurrencyGbp(breakdown.snugglePoolContribution)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Total shared sales team pool</span>
              <span>{formatCurrencyGbp(breakdown.totalSharedSalesTeamPool)}</span>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-[#12131a] p-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between">
              <span>Johan PK Tax</span>
              <span>{formatCurrencyGbp(breakdown.johanPkTax)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Johan separate payout at 40%</span>
              <span>{formatCurrencyGbp(breakdown.johanSeparatePayout)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total initial non-recipient calculated shared-pool share</span>
              <span>{formatCurrencyGbp(breakdown.totalInitialNonRecipientShare)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total redistributed amount</span>
              <span>{formatCurrencyGbp(breakdown.totalRedistributedAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total final shared pool payout GBP</span>
              <span>{formatCurrencyGbp(breakdown.totalFinalSharedPoolPayoutGbp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total separate Johan payout GBP</span>
              <span>{formatCurrencyGbp(breakdown.totalSeparateJohanPayoutGbp)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Total payable GBP</span>
              <span>{formatCurrencyGbp(breakdown.totalPayableGbp)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Total payable ZAR</span>
              <span>{formatCurrencyZar(breakdown.totalPayableZar)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Remaining / rounding difference against total shared sales team pool</span>
              <span>{formatCurrencyGbp(breakdown.remainingDifference)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total weighted score</span>
              <span>{formatPercent(breakdown.totalWeightedScore)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Eligible weighted score total</span>
              <span>{formatPercent(breakdown.eligibleWeightedScoreTotal)}</span>
            </div>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Factory Invoice"
        description="Expand to view the invoice total Justin Baker / EPCC should be billed for the Netsuite PK Tax portion only."
        isOpen={isFactoryInvoiceOpen}
        onToggle={() => setIsFactoryInvoiceOpen((current) => !current)}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-zinc-400">
            Invoice Justin Baker / EPCC for this GBP total. This is 60% of the total Netsuite PK
            Tax and does not include any Snuggle profit.
          </p>

          <button
            type="button"
            onClick={handleCopyFactoryInvoiceTotal}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-500/50 hover:bg-red-500/15"
          >
            Copy Factory Invoice Total
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-[#12131a] p-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between">
              <span>EPCC / PK Tax portion, 40% of total Netsuite PK Tax</span>
              <span>{formatCurrencyGbp(factoryPkTaxPortion)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin / bank fees, 10% of total Netsuite PK Tax</span>
              <span>{formatCurrencyGbp(factoryAdminFees)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Marketing, 5% of total Netsuite PK Tax</span>
              <span>{formatCurrencyGbp(factoryMarketing)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Operations, 5% of total Netsuite PK Tax</span>
              <span>{formatCurrencyGbp(factoryOperations)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-400/80">
              Factory Invoice Total
            </p>
            <p className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {formatCurrencyGbp(factoryInvoiceTotal)}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              This total is based only on Netsuite PK Tax at 60% and is separate from all account
              manager payouts, Snuggle values, and ZAR totals.
            </p>
          </div>
        </div>
      </AccordionSection>

      {isGuideOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          onClick={() => setIsGuideOpen(false)}
        >
          <div
            ref={guideDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={guideTitleId}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#0b0c10] shadow-[0_0_40px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 bg-[#111219] px-5 py-4 sm:px-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-400/80">
                  Reference Guide
                </p>
                <h2 id={guideTitleId} className="text-lg font-bold text-white sm:text-xl">
                  PK Tax Guide
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                className="rounded-full border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-300"
                aria-label="Close PK Tax Guide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
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

            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-400">
                    Allocation Rules
                  </h3>
                  <div className="mt-3 space-y-3">
                    {ALLOCATION_RULES.map((rule) => (
                      <div
                        key={rule}
                        className="rounded-2xl border border-zinc-800 bg-[#111219] px-4 py-3 text-sm leading-6 text-zinc-300"
                      >
                        {rule}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-400">
                    Report Sources
                  </h3>
                  <div className="mt-3 space-y-3">
                    {REPORT_SOURCES.map((source) => (
                      <div
                        key={source.title}
                        className="rounded-2xl border border-zinc-800 bg-[#111219] px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-white">{source.title}</p>
                        <p className="mt-1 text-sm leading-6 text-zinc-300">{source.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-400">
                    Checks
                  </h3>
                  <div className="mt-3 space-y-3">
                    {CHECKS_GUIDE.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-zinc-800 bg-[#111219] px-4 py-3 text-sm leading-6 text-zinc-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
