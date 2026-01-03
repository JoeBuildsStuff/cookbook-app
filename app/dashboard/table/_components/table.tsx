import { columns } from "./columns"
import { DataTable } from "@/components/data-table/data-table"
import { dataTableSearchParamsCache, parseDataTableSearchParams } from "@/lib/data-table-search-params"
import type { SearchParams } from "nuqs/server"

interface DataTableTableProps {
  searchParams: Promise<SearchParams>
}

const data = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    age: 25,
    registered: "2024-01-01",
  },
  {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    age: 26,
    registered: "2024-01-02",
  },
]

export default async function DataTableTable({ 
  searchParams 
}: DataTableTableProps) {
  // Parse search params using nuqs cache
  const parsedParams = await dataTableSearchParamsCache.parse(searchParams)
  
  // Convert to DataTableState format
  const initialState = parseDataTableSearchParams(parsedParams)

  const pageCount = Math.ceil((data.length ?? 0) / (initialState.pagination.pageSize ?? 10))

  return (
      <DataTable 
        columns={columns} 
        data={data} 
        pageCount={pageCount}
        initialState={initialState}
        tableKey="table-1"
      />
  )
}
