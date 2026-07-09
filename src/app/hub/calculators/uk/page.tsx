import BackLink from "@/components/BackLink"
import NavigationCard from "@/components/NavigationCard"

export default function UkCalculatorsPage() {
  return (
    <div className="hub-page-stack">
      <BackLink href="/hub/calculators">Back to Regions</BackLink>

      <section className="hub-panel hub-page-header">
        <h1 className="hub-page-header-title">UK Trade Calculator</h1>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <NavigationCard
          href="/hub/calculators/uk/trade"
          title="UK Trade Calculator"
          icon={
            <>
              <path d="M4 4h16v16H4z" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </>
          }
        />
      </div>
    </div>
  )
}
