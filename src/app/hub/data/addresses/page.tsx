import { connection } from "next/server"
import BackLink from "@/components/BackLink"
import { listSavedInvoiceAddresses } from "../../commercial-invoices/data"
import AddressReferenceClient from "./AddressReferenceClient"

export default async function SavedAddressesDataPage() {
  await connection()
  const addresses = await listSavedInvoiceAddresses()

  return (
    <div className="hub-page-stack">
      <BackLink href="/hub/data">Back to Data</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">Data</p>
        <h1 className="hub-page-header-title">Saved Addresses</h1>
        <p className="hub-page-header-copy">Maintain reusable commercial invoice sender and receiver records.</p>
      </section>

      <AddressReferenceClient initialAddresses={addresses} />
    </div>
  )
}
