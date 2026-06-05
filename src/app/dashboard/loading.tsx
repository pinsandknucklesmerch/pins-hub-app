import Link from "next/link"

export default function Loading() {
  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto font-sans bg-transparent min-h-screen">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-zinc-100 mb-6 transition-colors">
        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Hub
      </Link>

      <div className="mb-8">
        <div className="h-9 w-72 max-w-full rounded bg-zinc-800 animate-pulse" />
      </div>

      <div className="rounded-2xl border border-zinc-800/80 bg-[#0b0c10] p-6 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-3 w-3 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <div className="h-4 w-40 rounded bg-zinc-800 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-11 rounded-lg bg-zinc-900 animate-pulse" />
            <div className="h-11 rounded-lg bg-zinc-900 animate-pulse" />
            <div className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-11 rounded-lg bg-zinc-900 animate-pulse" />
            <div className="h-11 rounded-lg bg-zinc-900 animate-pulse" />
            <div className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
