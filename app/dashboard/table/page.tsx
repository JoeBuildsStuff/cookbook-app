import DataTableTable from "./_components/table"
import type { SearchParams } from "nuqs/server"
import { dataTableSearchParamsCache, parseDataTableSearchParams } from "@/lib/data-table-search-params"

export default async function DataTableTablePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  // Parse search params server-side
  const parsedParams = await dataTableSearchParamsCache.parse(searchParams)

  // Convert to DataTableState format and set default column visibility
  const parsedInitialState = parseDataTableSearchParams(parsedParams)
  const initialState = {
    ...parsedInitialState,
    columnVisibility: {
      ...parsedInitialState.columnVisibility,
      idx: false,
      id: false,
    },
  }

  return (
    <main className="">
      <DataTableTable initialState={initialState} />
    </main>
  )
}