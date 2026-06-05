import Link from "next/link"

export default function Loading() {
  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto font-sans bg-transparent min-h-screen">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-zinc-100 mb-6 transition-colors">
        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Hub
      </Link>
      <div className="h-9 w-72 rounded bg-zinc-800 mb-8" />
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="h-11 w-full max-w-md rounded-lg bg-zinc-900" />
        <div className="h-11 w-36 rounded-xl bg-zinc-900" />
      </div>
      <div className="rounded-2xl border border-zinc-800/80 bg-[#0b0c10] min-h-[600px] overflow-hidden">
        <div className="grid grid-cols-6 gap-4 border-b border-zinc-800 bg-[#111219] p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-4 rounded bg-zinc-800" />
          ))}
        </div>
        <div className="divide-y divide-zinc-800/50">
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-6 gap-4 p-4">
              {Array.from({ length: 6 }).map((_, colIndex) => (
                <div key={colIndex} className="h-5 rounded bg-zinc-900" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
