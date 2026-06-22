const showStagingUpdates = process.env.NEXT_PUBLIC_SHOW_STAGING_UPDATES === "true"

export default function StagingUpdatesPanel() {
  if (!showStagingUpdates) {
    return null
  }

  // Manually maintained staging notes. Do not auto-edit unless explicitly requested.
  return (
    <div className="rounded-xl border border-brand-red/35 bg-brand-red/10 p-3 shadow-[0_0_0_1px_rgba(222,59,67,0.08)] sm:rounded-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-red">Staging Updates</p>
      <p className="mt-1 text-xs leading-5 text-brand-muted">
        EU embroidery calculator update is ready for review.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-brand-muted">
        <li>Embroidery 1, 2, and 3 now sit with the print/embroidery position selector.</li>
        <li>Selected embroidery items support Small, Medium, and Large sizing.</li>
        <li>Embroidery pricing includes unit cost and digitizing fee.</li>
        <li>Please test copied quote output, VAT totals, and breakdown display.</li>
      </ul>
    </div>
  )
}
