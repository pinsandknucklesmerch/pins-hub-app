import BackLink from "@/components/BackLink"
import NavigationCard from "@/components/NavigationCard"

export default function DataManagementPage() {
  return (
    <div className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">Data</p>
        <h1 className="hub-page-header-title">Data Management</h1>
        <p className="hub-page-header-copy">
          View and maintain shared product, address, and invoice reference data used across Pins Hub.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <NavigationCard
          href="/hub/data/garments"
          title="Garments"
          description="Maintain the shared garment catalogue used by pricing and reference workflows."
          badge="Active"
          icon={<path d="M20.38 3.46 16 2l-2 3-2-3-4.38 1.46L6 9l3 2v9h6v-9l3-2Z" />}
        />
        <NavigationCard
          href="/hub/data/commodity-codes"
          title="Commodity Codes"
          description="Maintain commercial invoice product/material reference codes."
          badge="Active"
          icon={
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h10" />
              <path d="M7 4v16" />
            </>
          }
        />
        <NavigationCard
          href="/hub/data/addresses"
          title="Saved Addresses"
          description="Maintain reusable invoice sender and receiver address records."
          badge="Active"
          icon={
            <>
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </>
          }
        />
      </section>
    </div>
  )
}
