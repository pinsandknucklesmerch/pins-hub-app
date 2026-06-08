import Link from "next/link"
import { connection } from "next/server"
import { prisma } from "@/lib/db"

export default async function ReferralLandingPage({
  params
}: {
  params: Promise<{ code: string }>
}) {
  await connection()
  const { code } = await params
  const referralCode = code.toUpperCase()
  const customer = await prisma.customer.findUnique({
    where: { referralCode },
    select: {
      name: true,
      referralCode: true
    }
  })

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-[5%] h-[35rem] w-[35rem] rounded-full bg-red-900/20 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[25rem] w-[25rem] rounded-full bg-zinc-800/30 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl rounded-[28px] border border-zinc-800 bg-[#0b0c10]/95 p-8 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">Referral Link</p>
        {customer ? (
          <>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
              Referral code confirmed
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-zinc-400">
              This link belongs to <span className="font-semibold text-white">{customer.name}</span>.
              Use code <span className="font-mono text-red-300">{customer.referralCode}</span> when
              creating the referred customer in the dashboard.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
              Referral code not found
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-zinc-400">
              The code <span className="font-mono text-red-300">{referralCode}</span> does not match
              an existing customer record.
            </p>
          </>
        )}

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#111219] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Next Step</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            QR generation can be added later against this route without changing the referral data
            model or customer links.
          </p>
        </div>

        <Link
          href="/dashboard/refferals"
          className="mt-8 inline-flex items-center rounded-xl border border-red-500/20 bg-red-600/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-600/20"
        >
          Go to Refferals Dashboard
        </Link>
      </div>
    </div>
  )
}
