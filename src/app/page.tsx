import NavigationCard from "@/components/NavigationCard"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-6 py-12 text-white md:px-10 lg:px-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-red-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute right-[0%] top-[40%] h-[40%] w-[40%] rounded-full bg-zinc-800/30 blur-[100px] mix-blend-screen" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col">
        <div className="mb-16">
          <h1 className="mb-4 text-5xl font-black uppercase tracking-[0.18em] text-white sm:text-6xl">
            Pins
            <br />
            Hub
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
            Welcome to Pins Hub. Access internal calculators, manage orders,
            and view directories.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <NavigationCard
            href="/hub/calculators"
            title="Price Calculators"
            description="Choose Calculator, compare production cost, and prepare customer quotes."
            badge="Open Tool"
            icon={
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
                <rect width="16" height="20" x="4" y="2" rx="2" />
                <line x1="8" x2="16" y1="6" y2="6" />
                <line x1="16" x2="16" y1="14" y2="18" />
                <path d="M8 10h.01" />
                <path d="M12 14h.01" />
                <path d="M12 18h.01" />
                <path d="M8 18h.01" />
              </svg>
            }
          />

          <NavigationCard
            href="/hub/garments"
            title="Garment Directory"
            description="Manage garment references, base costs, tags, and codes used by the calculators."
            badge="Open Tool"
            icon={
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
                <path d="M6 3h12l3 6-9 12L3 9l3-6z" />
                <path d="M3 9h18" />
                <path d="m9 3 3 18 3-18" />
              </svg>
            }
          />

          <NavigationCard
            title="Order Management"
            description="Track and manage active merchandise orders, invoices, and fulfillment status."
            badge="Coming Soon"
            disabled
            icon={
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
                <path d="M3 7h18" />
                <path d="M6 3h12v18H6z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            }
          />

          <NavigationCard
            href="/hub/pk-tax"
            title="PK Tax"
            description="Calculate monthly PK Tax pool, weighted performance, and payout splits."
            badge="Open Tool"
            icon={
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
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />

          <NavigationCard
            href="/hub/referrals"
            title="Referrals"
            description="Track referral codes, customer links, loyalty rewards, and status updates."
            badge="Open Tool"
            icon={
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 8v6" />
                <path d="M23 11h-6" />
              </svg>
            }
          />

        </div>
      </main>
    </div>
  )
}
