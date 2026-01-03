import { columns, type DataTableRow } from "./columns"
import { DataTable } from "@/components/data-table/data-table"
import { dataTableSearchParamsCache, parseDataTableSearchParams } from "@/lib/data-table-search-params"
import type { SearchParams } from "nuqs/server"
import rawData from "./data.json"

interface DataTableTableProps {
  searchParams: Promise<SearchParams>
}

type RawDataItem = {
  idx: number
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  nickname: string | null
  primary_email: string
  primary_phone: string
  company: string
  job_title: string
  birthday: string
  notes: string
  is_favorite: boolean
  tags: string[]
  display_name: string
}

// Transform the JSON data to match the table structure
function transformData(rawData: RawDataItem[]): DataTableRow[] {
  return rawData.map((item) => {
    // Calculate age from birthday
    const calculateAge = (birthday: string): number => {
      const birthDate = new Date(birthday)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    }

    // Format created_at date
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    return {
      idx: item.idx,
      id: item.id,
      name: item.display_name || `${item.first_name} ${item.last_name}`.trim(),
      firstName: item.first_name || "",
      lastName: item.last_name || "",
      nickname: item.nickname || null,
      email: item.primary_email || "",
      phone: item.primary_phone || "",
      age: item.birthday ? calculateAge(item.birthday) : 0,
      birthday: item.birthday || "",
      company: item.company || "",
      jobTitle: item.job_title || "",
      notes: item.notes || "",
      isFavorite: item.is_favorite || false,
      tags: item.tags || [],
      registered: formatDate(item.created_at),
      updatedAt: formatDate(item.updated_at),
    }
  })
}

const data = transformData(rawData)

export default async function DataTableTable({ 
  searchParams 
}: DataTableTableProps) {
  // Parse search params using nuqs cache
  const parsedParams = await dataTableSearchParamsCache.parse(searchParams)
  
  // Convert to DataTableState format
  const parsedInitialState = parseDataTableSearchParams(parsedParams)
  
  // Set initial column visibility - hide idx and id columns by default
  const initialState = {
    ...parsedInitialState,
    columnVisibility: {
      ...parsedInitialState.columnVisibility,
      idx: false,
      id: false,
    },
  }

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
