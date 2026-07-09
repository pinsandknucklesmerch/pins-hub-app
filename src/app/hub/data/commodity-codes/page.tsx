import { connection } from "next/server"
import BackLink from "@/components/BackLink"
import { listCommercialInvoiceCommodityCodes } from "../../commercial-invoices/data"
import CommodityCodeReferenceClient from "./CommodityCodeReferenceClient"

export default async function CommodityCodesDataPage() {
  await connection()
  const commodityCodes = await listCommercialInvoiceCommodityCodes()

  return (
    <div className="hub-page-stack">
      <BackLink href="/hub/data">Back to Data</BackLink>

      <section className="hub-panel hub-page-header">
        <h1 className="hub-page-header-title">Commodity Codes</h1>
      </section>

      <CommodityCodeReferenceClient initialCommodityCodes={commodityCodes} />
    </div>
  )
}
