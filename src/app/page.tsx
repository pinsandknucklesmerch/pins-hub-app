import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black font-sans selection:bg-red-600 selection:text-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[40%] right-[0%] w-[40%] h-[40%] bg-zinc-800/30 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-20 relative z-10 flex flex-col">
        
        {/* Header Section */}
        <div className="mb-16">
          <p className="text-red-600 font-bold tracking-widest text-sm uppercase mb-2">Internal Tools</p>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4">
            Pins&amp;Knuckles <br/
            >Hub
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl leading-relaxed">
            Welcome to the central hub. Access internal calculators, manage orders, and view directories.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Calculator Card */}
          <Link href="/dashboard/calculator" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-red-600 to-zinc-800 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-full bg-zinc-950 border border-zinc-800 p-8 rounded-2xl flex flex-col items-start transition-all hover:bg-zinc-900 overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="16" height="20" x="4" y="2" rx="2"/>
                  <line x1="8" x2="16" y1="6" y2="6"/>
                  <line x1="16" x2="16" y1="14" y2="18"/>
                  <path d="M16 10h.01"/>
                  <path d="M12 10h.01"/>
                  <path d="M8 10h.01"/>
                  <path d="M12 14h.01"/>
                  <path d="M8 14h.01"/>
                  <path d="M12 18h.01"/>
                  <path d="M8 18h.01"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-red-500 transition-colors">Pricing Calculator</h2>
              <p className="text-zinc-400 mb-6 flex-1 text-sm leading-relaxed">
                Calculate total costs including garments, prints, and markups based on the pricing matrix.
              </p>
              <div className="mt-auto flex items-center text-sm font-semibold text-white uppercase tracking-wider group-hover:text-red-400">
                Launch App
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </Link>
          
          {/* Garment Directory Card */}
          <Link href="/dashboard/garments" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-red-600 to-zinc-800 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-full bg-zinc-950 border border-zinc-800 p-8 rounded-2xl flex flex-col items-start transition-all hover:bg-zinc-900 overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-zinc-800/50 group-hover:bg-red-600/10 text-zinc-500 group-hover:text-red-500 flex items-center justify-center mb-6 transition-colors group-hover:scale-110 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                  <path d="M3 15h6"/>
                  <path d="M3 18h6"/>
                  <path d="M3 21h6"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-red-500 transition-colors">Garment Directory</h2>
              <p className="text-zinc-400 mb-6 flex-1 text-sm leading-relaxed">
                Browse the catalog of available garments, check stock levels, and update base prices.
              </p>
              <div className="mt-auto flex items-center text-sm font-semibold text-white uppercase tracking-wider group-hover:text-red-400">
                Launch App
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </Link>

          {/* Placeholder Card 1 */}
          <div className="relative h-full bg-zinc-950/50 border border-zinc-800/50 p-8 rounded-2xl flex flex-col items-start opacity-70">
            <div className="w-12 h-12 rounded-full bg-zinc-800/50 text-zinc-500 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-300 mb-2 tracking-tight">Order Management</h2>
            <p className="text-zinc-500 mb-6 flex-1 text-sm leading-relaxed">
              Track and manage active merchandise orders, invoices, and fulfillment status.
            </p>
            <div className="mt-auto px-3 py-1 bg-zinc-800/80 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Coming Soon
            </div>
          </div>

          {/* PK Tax Placeholder */}
          <div className="relative h-full bg-zinc-950/50 border border-zinc-800/50 p-8 rounded-2xl flex flex-col items-start opacity-70">
            <div className="w-12 h-12 rounded-full bg-zinc-800/50 text-zinc-500 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-300 mb-2 tracking-tight">PK Tax</h2>
            <p className="text-zinc-500 mb-6 flex-1 text-sm leading-relaxed">
              Placeholder for internal tax tools and tax-related calculations.
            </p>
            <div className="mt-auto px-3 py-1 bg-zinc-800/80 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Coming Soon
            </div>
          </div>

          {/* Refferals Placeholder */}
          <div className="relative h-full bg-zinc-950/50 border border-zinc-800/50 p-8 rounded-2xl flex flex-col items-start opacity-70">
            <div className="w-12 h-12 rounded-full bg-zinc-800/50 text-zinc-500 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-300 mb-2 tracking-tight">Refferals</h2>
            <p className="text-zinc-500 mb-6 flex-1 text-sm leading-relaxed">
              Placeholder for tracking referral sources, partners, and rewards.
            </p>
            <div className="mt-auto px-3 py-1 bg-zinc-800/80 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Coming Soon
            </div>
          </div>

          {/* US Calculator Placeholder */}
          <div className="relative h-full bg-zinc-950/50 border border-zinc-800/50 p-8 rounded-2xl flex flex-col items-start opacity-70">
            <div className="w-12 h-12 rounded-full bg-zinc-800/50 text-zinc-500 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="16" height="20" x="4" y="2" rx="2" />
                <line x1="8" x2="16" y1="6" y2="6" />
                <path d="M8 11h.01" />
                <path d="M12 11h.01" />
                <path d="M16 11h.01" />
                <path d="M8 16h.01" />
                <path d="M12 16h.01" />
                <path d="M16 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-300 mb-2 tracking-tight">US Calculator</h2>
            <p className="text-zinc-500 mb-6 flex-1 text-sm leading-relaxed">
              Placeholder for US pricing, currency, and market-specific calculations.
            </p>
            <div className="mt-auto px-3 py-1 bg-zinc-800/80 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Coming Soon
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
