import BackLink from "@/components/BackLink"
import SalesDashboardClient from "./SalesDashboardClient"
import { salesDashboardData } from "./data"

export default function SalesDashboardPage() {
  return (
    <div className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>
      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">Sales Tools</p>
        <h1 className="hub-page-header-title">Sales Dashboard</h1>
        <p className="hub-page-header-copy">
          Read-only sales performance view based on monthly reporting.
        </p>
      </section>
      <SalesDashboardClient data={salesDashboardData} />
    </div>
  )
}
