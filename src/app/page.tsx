import HubSidebar from "@/components/HubSidebar"
import BrandLogo from "@/components/BrandLogo"
import NavigationCard from "@/components/NavigationCard"

export default function Home() {
  return (
    <div className="hub-home-shell text-brand-cream">
      <div className="hub-home-frame">
        <HubSidebar />

        <main className="hub-home-main">
          <div className="flex flex-col gap-4">
            <section className="hub-home-hero">
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="hub-kicker">Pins Hub</p>
                    <BrandLogo className="mt-2 h-8 w-auto max-w-full opacity-90" />
                  </div>
                  <span className="rounded-full border border-brand-border bg-brand-panel-alt/70 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-brand-muted">
 6 Live Tools
                  </span>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-brand-muted md:text-[0.95rem]">
                  Pricing, garment data, commercial invoices, PK Tax workflows, referrals, and reusable operational copy in
                  one system.
                </p>
              </div>
            </section>

            <section className="hub-home-grid">
              <NavigationCard
                href="/hub/calculators"
                title="Price Calculators"
                description="Operational quote builders EU pricing flows client-ready copy."
                compact
                icon={
                  <>
                    <rect width="14" height="18" x="5" y="3" rx="2" />
                    <path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01" />
                  </>
                }
              />

              <NavigationCard
                href="/hub/data"
                title="Data Management"
                description="Shared product, address, and invoice reference data, with garments active now."
                compact
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
                href="/hub/pk-tax"
                title="PK Tax"
                description="Finance dashboard PK Tax, payout allocation, shared-pool outputs."
                compact
                icon={
                  <>
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </>
                }
              />

              <NavigationCard
                href="/hub/referrals"
                title="Refferals"
                description="Referral planning, scenario modelling, CRM-style team operations."
                compact
                icon={
                  <>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </>
                }
              />

              <NavigationCard
                href="/hub/commercial-invoices"
                title="Commercial Invoices"
                description="Manual commercial invoice builder for addresses, shipment details, line items."
                compact
                icon={
                  <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8" />
                    <path d="M8 17h5" />
                  </>
                }
              />

              <NavigationCard
                href="/hub/reference"
                title="Quick Reference"
                description="Operational copy, delivery import data, saved messages, supplier emails."
                compact
                icon={
                  <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8M8 17h6" />
                  </>
                }
              />

          </section>
          </div>
        </main>
      </div>
    </div>
  )
}
