import Link from "next/link"
import { connection } from "next/server"
import RefferalsClient from "./RefferalsClient"
import { getRefferalsData } from "./data"

export default async function RefferalsPage() {
  await connection()
  const data = await getRefferalsData()

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

      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">Sales Tools</p>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Refferals</h1>
        <p className="max-w-3xl text-zinc-400">
          Track referral codes, log referred customers, monitor statuses, and maintain loyalty
          points without keeping the system in your head.
        </p>
      </div>

      <RefferalsClient initialData={data} />
    </div>
  )
}
