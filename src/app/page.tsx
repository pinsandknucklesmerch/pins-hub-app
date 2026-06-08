import Link from "next/link"

function HubCard({
  href,
  title,
  description,
  icon,
  badge,
  active = false
}: {
  href?: string
  title: string
  description: string
  icon: React.ReactNode
  badge: string
  active?: boolean
}) {
  const content = (
    <div
      className={`relative h-full rounded-2xl p-8 flex flex-col items-start transition-all duration-300 ${
        active
          ? "bg-zinc-950/80 border border-zinc-800 hover:border-red-500/40 hover:bg-zinc-950 hover:shadow-[0_0_25px_rgba(239,68,68,0.12)]"
          : "bg-zinc-950/50 border border-zinc-800/50 opacity-70"
      }`}
    >
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/50 text-zinc-500">
        {icon}
      </div>
      <h2
        className={`mb-2 text-xl font-bold tracking-tight ${
          active ? "text-zinc-300 transition-colors group-hover:text-white" : "text-zinc-300"
        }`}
      >
        {title}
      </h2>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-zinc-500">{description}</p>
      <div
        className={`mt-auto rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
          active
            ? "inline-flex items-center gap-2 border border-red-500/20 bg-red-600/10 text-red-300"
            : "bg-zinc-800/80 text-zinc-400"
        }`}
      >
        {badge}
        {active ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        ) : null}
      </div>
    </div>
  )

  if (!href) {
    return content
  }

  return (
    <Link href={href} className="group relative">
      {content}
    </Link>
  )
}

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black font-sans selection:bg-red-600 selection:text-white">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-red-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute right-[0%] top-[40%] h-[40%] w-[40%] rounded-full bg-zinc-800/30 blur-[100px] mix-blend-screen" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-20">
        <div className="mb-16">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-red-600">
            Internal Tools
          </p>
          <h1 className="mb-4 text-5xl font-black uppercase tracking-tighter text-white md:text-7xl">
            Pins&amp;Knuckles
            <br />
            Hub
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
            Welcome to the central hub. Access internal calculators, manage orders, and view
            directories.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <HubCard
            href="/dashboard/calculator"
            title="Pricing Calculator"
            description="Run live EU pricing, compare production cost, and prepare customer quotes."
            badge="Open Tool"
            active
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
                <path d="M8 14h.01" />
                <path d="M12 18h.01" />
                <path d="M8 18h.01" />
              </svg>
            }
          />

          <HubCard
            href="/dashboard/garments"
            title="Garment Directory"
            description="Manage garment references, base costs, tags, and codes used by the calculators."
            badge="Open Tool"
            active
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
                <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M3 15h6" />
                <path d="M3 18h6" />
                <path d="M3 21h6" />
              </svg>
            }
          />

          <HubCard
            title="Order Management"
            description="Track and manage active merchandise orders, invoices, and fulfillment status."
            badge="Coming Soon"
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
            }
          />

          <HubCard
            title="PK Tax"
            description="Placeholder for internal tax tools and tax-related calculations."
            badge="Coming Soon"
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
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />

          <HubCard
            href="/dashboard/refferals"
            title="Refferals"
            description="Track referral codes, customer links, loyalty rewards, and status updates."
            badge="Open Tool"
            active
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
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
              </svg>
            }
          />

          <HubCard
            title="US Calculator"
            description="Placeholder for US pricing, currency, and market-specific calculations."
            badge="Coming Soon"
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
                <path d="M8 11h.01" />
                <path d="M12 11h.01" />
                <path d="M16 11h.01" />
                <path d="M8 16h.01" />
                <path d="M12 16h.01" />
                <path d="M16 16h.01" />
              </svg>
            }
          />
        </div>
      </main>
    </div>
  )
}
