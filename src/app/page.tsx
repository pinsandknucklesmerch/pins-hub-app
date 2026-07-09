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
                    <BrandLogo className="mt-2 h-8 w-auto max-w-full opacity-90" />
                  </div>
                </div>
              </div>
            </section>

            <section className="hub-home-grid">
              <NavigationCard
                href="/hub/calculators"
                title="Price Calculators"
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
                               compact
                icon={
                  <>
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </>
                }
              />

              <NavigationCard
                href="/hub/commercial-invoices"
                title="Commercial Invoices"
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
