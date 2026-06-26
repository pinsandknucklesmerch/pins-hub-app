import { connection } from "next/server"
import BackLink from "@/components/BackLink"
import CommercialInvoiceClient from "./CommercialInvoiceClient"
import { listCommercialInvoices } from "./data"

export default async function CommercialInvoicesPage() {
  await connection()
  const data = await listCommercialInvoices()

  return (
    <div className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">Sales Tools</p>
        <h1 className="hub-page-header-title">Commercial Invoice Generator</h1>
        <p className="hub-page-header-copy">
          Build editable commercial invoices from saved addresses, garment/product details, and manual shipment data.
        </p>
      </section>

      <CommercialInvoiceClient initialData={data} />
    </div>
  )
}
