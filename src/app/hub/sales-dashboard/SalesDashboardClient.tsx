"use client"

import type {
  MonthlyComparisonRow,
  MonthlySalesRepRow,
  SalesDashboardData,
  SalesInboxRow,
} from "./data"

const numberFormatter = new Intl.NumberFormat("en-GB")
const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
})
const percentFormatter = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 1,
})

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`
}

function getConversionRate(converted: number, enquiries: number) {
  if (enquiries === 0) return 0
  return (converted / enquiries) * 100
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-brand-muted">
        No sales data available.
      </td>
    </tr>
  )
}

function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex flex-col gap-1 px-1">
      <h2 className="text-base font-black text-brand-cream">{title}</h2>
      {detail ? <p className="text-xs leading-5 text-brand-muted">{detail}</p> : null}
    </div>
  )
}

function KpiCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="hub-panel-subtle rounded-[1.1rem] p-4">
      <p className="text-xs font-bold text-brand-muted">{label}</p>
      <p className="mt-2 text-2xl font-black tabular-nums text-brand-cream">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-brand-muted-soft">{detail}</p>
    </div>
  )
}

function buildRepPerformance(rows: MonthlySalesRepRow[]) {
  const totalEnquiries = rows.reduce((sum, row) => sum + row.enquiries, 0)
  const reps = new Map<
    string,
    {
      salesRep: string
      enquiries: number
      converted: number
      totalProfit: number
    }
  >()

  for (const row of rows) {
    const current =
      reps.get(row.salesRep) ??
      {
        salesRep: row.salesRep,
        enquiries: 0,
        converted: 0,
        totalProfit: 0,
      }

    current.enquiries += row.enquiries
    current.converted += row.converted
    current.totalProfit += row.profit
    reps.set(row.salesRep, current)
  }

  return Array.from(reps.values())
    .map((rep) => ({
      ...rep,
      share: totalEnquiries === 0 ? 0 : (rep.enquiries / totalEnquiries) * 100,
      conversionRate: getConversionRate(rep.converted, rep.enquiries),
      averageProfitPerJob: rep.converted === 0 ? 0 : rep.totalProfit / rep.converted,
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit)
}

function MonthlyComparisonTable({ rows }: { rows: MonthlyComparisonRow[] }) {
  return (
    <div className="hub-table-shell overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead className="hub-table-head text-[11px] font-black uppercase text-brand-muted">
          <tr>
            <th className="px-4 py-3">Month</th>
            <th className="px-4 py-3 text-right">Enquiries 2022</th>
            <th className="px-4 py-3 text-right">Enquiries 2023</th>
            <th className="px-4 py-3 text-right">Enquiries 2024</th>
            <th className="px-4 py-3 text-right">Enquiries 2025</th>
            <th className="px-4 py-3 text-right">Conversions 2022</th>
            <th className="px-4 py-3 text-right">Conversions 2023</th>
            <th className="px-4 py-3 text-right">Conversions 2024</th>
            <th className="px-4 py-3 text-right">Conversions 2025</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {rows.length === 0 ? (
            <EmptyRow colSpan={9} />
          ) : (
            rows.map((row) => (
              <tr key={row.month} className="hub-table-row">
                <td className="px-4 py-3 font-bold text-brand-cream">{row.month}</td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatNumber(row.enquiries[2022])}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatNumber(row.enquiries[2023])}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatNumber(row.enquiries[2024])}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-cream">
                  {formatNumber(row.enquiries[2025])}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatNumber(row.conversions[2022])}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatNumber(row.conversions[2023])}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatNumber(row.conversions[2024])}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-cream">
                  {formatNumber(row.conversions[2025])}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function SalesRepPerformanceTable({ rows }: { rows: MonthlySalesRepRow[] }) {
  const repRows = buildRepPerformance(rows)

  return (
    <div className="hub-table-shell overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse text-left text-sm">
        <thead className="hub-table-head text-[11px] font-black uppercase text-brand-muted">
          <tr>
            <th className="px-4 py-3">Sales Rep</th>
            <th className="px-4 py-3 text-right">Enquiries</th>
            <th className="px-4 py-3 text-right">Share %</th>
            <th className="px-4 py-3 text-right">Converted</th>
            <th className="px-4 py-3 text-right">Conversion Rate %</th>
            <th className="px-4 py-3 text-right">Total Profit</th>
            <th className="px-4 py-3 text-right">Average Profit Per Job</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {repRows.length === 0 ? (
            <EmptyRow colSpan={7} />
          ) : (
            repRows.map((row) => (
              <tr key={row.salesRep} className="hub-table-row">
                <td className="px-4 py-3 font-bold text-brand-cream">{row.salesRep}</td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatNumber(row.enquiries)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatPercent(row.share)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatNumber(row.converted)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-cream">
                  {formatPercent(row.conversionRate)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-cream">
                  {formatCurrency(row.totalProfit)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatCurrency(row.averageProfitPerJob)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function SalesInboxTable({ rows }: { rows: SalesInboxRow[] }) {
  return (
    <div className="hub-table-shell overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead className="hub-table-head text-[11px] font-black uppercase text-brand-muted">
          <tr>
            <th className="px-4 py-3">Month</th>
            <th className="px-4 py-3 text-right">Enquiries</th>
            <th className="px-4 py-3 text-right">Converted</th>
            <th className="px-4 py-3 text-right">Conversion Rate %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {rows.length === 0 ? (
            <EmptyRow colSpan={4} />
          ) : (
            rows.map((row) => (
              <tr key={row.month} className="hub-table-row">
                <td className="px-4 py-3 font-bold text-brand-cream">{row.month}</td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatNumber(row.enquiries)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-muted">
                  {formatNumber(row.converted)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-cream">
                  {formatPercent(getConversionRate(row.converted, row.enquiries))}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function SalesDashboardClient({ data }: { data: SalesDashboardData }) {
  const activeSummary =
    data.yearSummary.find((summary) => summary.year === data.activeYear) ??
    data.yearSummary[data.yearSummary.length - 1]

  const conversionRate = activeSummary
    ? getConversionRate(activeSummary.conversions, activeSummary.enquiries)
    : 0

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Enquiries"
          value={formatNumber(activeSummary?.enquiries ?? 0)}
          detail={`${data.activeYear} workbook year summary`}
        />
        <KpiCard
          label="Total Converted"
          value={formatNumber(activeSummary?.conversions ?? 0)}
          detail="Converted jobs from enquiry reporting"
        />
        <KpiCard
          label="Conversion Rate"
          value={formatPercent(conversionRate)}
          detail="Converted divided by total enquiries"
        />
        <KpiCard
          label="Total Profit"
          value={formatCurrency(activeSummary?.profit ?? 0)}
          detail={`Profit per job ${formatCurrency(activeSummary?.profitPer ?? 0)}`}
        />
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle
          title="Monthly Comparison"
          detail="Workbook-style enquiry and conversion totals by month and year."
        />
        <MonthlyComparisonTable rows={data.monthlyComparison} />
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle title="Sales Rep Performance" detail="Aggregated from monthly per-sales-rep fixture rows." />
        <SalesRepPerformanceTable rows={data.monthlySalesRepData} />
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle title="Sales Inbox" detail="Monthly Sales Inbox enquiry and conversion view." />
        <SalesInboxTable rows={data.salesInbox} />
      </section>
    </div>
  )
}
