import DataTableTable from "./_components/table"
import type { SearchParams } from "nuqs/server"

export default async function DataTableTablePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  return (
    <main className="">
      <DataTableTable searchParams={searchParams} />
    </main>
  )
}