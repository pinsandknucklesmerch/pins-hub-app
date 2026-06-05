import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"

const GARMENT_DIRECTORY_TAG = "garment-directory"

async function loadGarmentDirectoryData() {
  return prisma.garment.findMany({
    orderBy: { name: "asc" }
  })
}

export const getGarmentDirectoryData = unstable_cache(
  loadGarmentDirectoryData,
  ["garment-directory-data"],
  { tags: [GARMENT_DIRECTORY_TAG] }
)

export function getGarmentDirectoryTag() {
  return GARMENT_DIRECTORY_TAG
}
