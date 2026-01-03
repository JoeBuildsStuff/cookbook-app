import { columns } from "./columns"
import { DataTable } from "@/components/data-table/data-table"
import { parseSearchParams, SearchParams } from "@/lib/data-table"

interface DataTableTableProps {
  searchParams?: SearchParams
}

const data = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
  },
  {
    name: "Jane Doe",
    email: "jane.doe@example.com",
  },
]

export default async function DataTableTable({ 
  searchParams = {} 
}: DataTableTableProps) {
  const { pagination } = parseSearchParams(searchParams)

  const pageCount = Math.ceil((data.length ?? 0) / (pagination?.pageSize ?? 10))
  const initialState = {
    ...parseSearchParams(searchParams),
    // columnVisibility: {
    //   name: false,
    //   email: false,
    // },
  }

  console.log(initialState)

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
