import BackLink from "@/components/BackLink"
import PkTaxCalculatorClient from "./PkTaxCalculatorClient"

export default function PkTaxPage() {
  return (
    <div className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>

      <section className="hub-panel hub-page-header">
        <h1 className="hub-page-header-title">PK Tax Calculator</h1>
      </section>

      <PkTaxCalculatorClient />
    </div>
  )
}
