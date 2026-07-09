import BackLink from "@/components/BackLink"
import NavigationCard from "@/components/NavigationCard"

export default function EuCalculatorsPage() {
  return (
    <div className="hub-page-stack">
      <BackLink href="/hub/calculators">Back to Regions</BackLink>

      <section className="hub-panel hub-page-header">
        <h1 className="hub-page-header-title">EU Calculator Routes</h1>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <NavigationCard
          href="/hub/calculators/eu/standard"
          title="Standard EU Calculator"
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
              <path d="M8 15h.01" />
              <path d="M12 15h.01" />
            </svg>
          }
        />

        <NavigationCard
          href="/hub/calculators/eu/us-clients"
          title="US Clients Calculator"
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
              <path d="M3 5h18" />
              <path d="M3 12h18" />
              <path d="M3 19h18" />
              <path d="M7 3v18" />
            </svg>
          }
        />
      </section>
    </div>
  )
}
