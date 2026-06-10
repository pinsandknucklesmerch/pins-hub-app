import Link from "next/link"
import { connection } from "next/server"

import CalculatorClient from "./CalculatorClient"
import { getCalculatorReferenceData } from "./data"
import type { CalculatorProfileCode } from "@/lib/calculator-profiles"

type CalculatorPageContentProps = {
  calculatorCode: CalculatorProfileCode
  title: string
  backHref: string
}

export default async function CalculatorPageContent({
  calculatorCode,
  title,
  backHref,
}: CalculatorPageContentProps) {
  await connection()

  const { garments, printPrices, garmentMarkups } =
    await getCalculatorReferenceData(calculatorCode)
return (
  <div className="min-h-screen w-full overflow-x-hidden bg-transparent font-sans">
    <div className="mx-auto w-full max-w-6xl min-w-0 p-6 md:p-8 lg:p-10">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <svg
          className="mr-2 h-4 w-4 shrink-0"
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
        Back to Calculators
      </Link>

      <h1 className="mb-8 text-3xl font-bold tracking-tight text-white">
        {title}
      </h1>

      <div className="w-full min-w-0">
        <CalculatorClient
          garments={garments}
          printPrices={printPrices}
          garmentMarkups={garmentMarkups}
          calculatorTitle={title}
        />
      </div>
    </div>
  </div>
)
}
