import Link from "next/link"

export default function Loading() {
  return (
    <div className="min-h-screen mx-auto max-w-7xl bg-transparent p-6 font-sans md:p-8 lg:p-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <svg
          className="mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Hub
      </Link>

      <div className="mb-8 space-y-3">
        <div className="h-4 w-28 rounded bg-zinc-800 animate-pulse" />
        <div className="h-10 w-56 rounded bg-zinc-800 animate-pulse" />
        <div className="h-5 w-full max-w-2xl rounded bg-zinc-800 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]"
          >
            <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
            <div className="mt-4 h-8 w-20 rounded bg-zinc-800 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
        <div className="space-y-5">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]"
            >
              <div className="h-6 w-48 rounded bg-zinc-800 animate-pulse" />
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {Array.from({ length: 3 }).map((__, innerIndex) => (
                  <div
                    key={innerIndex}
                    className="h-20 rounded-xl border border-zinc-800 bg-[#111219] animate-pulse"
                  />
                ))}
              </div>
              <div className="mt-4 h-48 rounded-xl border border-zinc-800 bg-[#111219] animate-pulse" />
            </div>
          ))}
        </div>

        <div className="space-y-5">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-[#0b0c10] p-5 shadow-[0_0_15px_rgba(0,0,0,0.18)]"
            >
              <div className="h-5 w-40 rounded bg-zinc-800 animate-pulse" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((__, innerIndex) => (
                  <div
                    key={innerIndex}
                    className="h-16 rounded-xl border border-zinc-800 bg-[#111219] animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
