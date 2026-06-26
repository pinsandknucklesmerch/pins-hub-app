import { connection } from "next/server"
import BackLink from "@/components/BackLink"
import GarmentDirectoryClient from "../../garments/GarmentDirectoryClient"
import { getGarmentDirectoryData } from "../../garments/data"

export default async function DataGarmentDirectoryPage() {
  await connection()
  const garments = await getGarmentDirectoryData()

  return (
    <div className="hub-page-stack">
      <BackLink href="/hub/data">Back to Data</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">Data</p>
        <h1 className="hub-page-header-title">Garment Directory</h1>
      </section>

      <div className="min-w-0">
        <GarmentDirectoryClient initialGarments={garments} />
      </div>
    </div>
  )
}
