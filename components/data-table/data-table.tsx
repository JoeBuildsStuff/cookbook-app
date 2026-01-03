"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table"
import {
  useQueryStates,
  parseAsInteger,
  parseAsString,
  parseAsJson,
} from "nuqs"

/**
 * Validator functions for JSON parsers
 * These return the value if valid, or null if invalid
 */
function isValidColumnFiltersState(value: unknown): ColumnFiltersState | null {
  return Array.isArray(value) ? value as ColumnFiltersState : null;
}

function isValidVisibilityState(value: unknown): VisibilityState | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) 
    ? value as VisibilityState 
    : null;
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import DataTableToolbar from "./data-table-toolbar"
import { 
  DataTableState,
} from "@/lib/data-table"
import { serializeDataTableState, parseDataTableSearchParams } from "@/lib/data-table-search-params"

/**
 * Props for the DataTable component
 */
export interface DataTableProps {
  /** Array of column definitions that define the table structure */
  columns: ColumnDef<Record<string, unknown>, unknown>[]
  /** Array of data objects to display in the table */
  data: Record<string, unknown>[]
  /** Initial state for the table including pagination, sorting, filters, etc. */
  initialState?: Partial<DataTableState>
  /** Total number of pages for server-side pagination */
  pageCount?: number
  /** Unique identifier for persisting saved views */
  tableKey: string
  /** Function to handle multi deletion of rows */
  deleteAction?: (ids: string[]) => Promise<{ success: boolean; error?: string; deletedCount?: number }>
  /** Function to handle creation of new rows */
  createAction?: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  /** Function to handle updating existing rows */
  updateActionSingle?: (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  /** Function to handle multi updating of multiple rows */
  updateActionMulti?: (ids: string[], data: Record<string, unknown>) => Promise<{ success: boolean; error?: string; updatedCount?: number }>
  /** Custom form component for adding new rows */
  customAddForm?: React.ComponentType<{
    onSuccess?: () => void
    onCancel?: () => void
    createAction?: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  }>
  /** Custom form component for editing existing rows */
  customEditFormSingle?: React.ComponentType<{
    data: Record<string, unknown>
    onSuccess?: () => void
    onCancel?: () => void
    updateAction?: (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  }>
  /** Custom form component for multi editing multiple rows */
  customEditFormMulti?: React.ComponentType<{
    selectedCount: number
    onSuccess?: () => void
    onCancel?: () => void
    multiUpdateAction?: (ids: string[], data: Record<string, unknown>) => Promise<{ success: boolean; error?: string; updatedCount?: number }>
  }>
}

interface DataTableInternalProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  initialState?: Partial<DataTableState>
  pageCount?: number
  tableKey: string
  deleteAction?: (ids: string[]) => Promise<{ success: boolean; error?: string; deletedCount?: number }>
  createAction?: (data: Partial<TData>) => Promise<{ success: boolean; error?: string }>
  updateActionSingle?: (id: string, data: Partial<TData>) => Promise<{ success: boolean; error?: string }>
  updateActionMulti?: (ids: string[], data: Partial<TData>) => Promise<{ success: boolean; error?: string; updatedCount?: number }>
  customAddForm?: React.ComponentType<{
    onSuccess?: () => void
    onCancel?: () => void
    createAction?: (data: Partial<TData>) => Promise<{ success: boolean; error?: string }>
  }>
  customEditFormSingle?: React.ComponentType<{
    data: TData
    onSuccess?: () => void
    onCancel?: () => void
    updateAction?: (id: string, data: Partial<TData>) => Promise<{ success: boolean; error?: string }>
  }>
  customEditFormMulti?: React.ComponentType<{
    selectedCount: number
    onSuccess?: () => void
    onCancel?: () => void
    multiUpdateAction?: (ids: string[], data: Partial<TData>) => Promise<{ success: boolean; error?: string; updatedCount?: number }>
  }>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  initialState,
  pageCount,
  tableKey,
  deleteAction,
  createAction,
  updateActionSingle,
  updateActionMulti,
  customAddForm,
  customEditFormSingle,
  customEditFormMulti,
}: DataTableInternalProps<TData, TValue>) {
  // Use nuqs to manage URL search params
  const [searchParams, setSearchParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(50),
      sort: parseAsString,
      filters: parseAsJson<ColumnFiltersState>(isValidColumnFiltersState),
      visibility: parseAsJson<VisibilityState>(isValidVisibilityState),
      order: parseAsString,
    },
    {
      history: "push",
      shallow: false,
    }
  )

  // Parse search params into table state
  const parsedState = React.useMemo(() => {
    return parseDataTableSearchParams(searchParams)
  }, [searchParams])

  // Initialize state from URL params or initial state
  const [sorting, setSorting] = React.useState<SortingState>(
    parsedState.sorting.length > 0 ? parsedState.sorting : (initialState?.sorting ?? [])
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    parsedState.columnFilters.length > 0 ? parsedState.columnFilters : (initialState?.columnFilters ?? [])
  )
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    Object.keys(parsedState.columnVisibility).length > 0 ? parsedState.columnVisibility : (initialState?.columnVisibility ?? {})
  )
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState<PaginationState>(
    parsedState.pagination.pageIndex !== 0 || parsedState.pagination.pageSize !== 50
      ? parsedState.pagination
      : (initialState?.pagination ?? { pageIndex: 0, pageSize: 10 })
  )
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    parsedState.columnOrder.length > 0 ? parsedState.columnOrder : (initialState?.columnOrder ?? [])
  )

  // Sync state changes to URL using nuqs
  React.useEffect(() => {
    const currentState: DataTableState = {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
    }

    const serializedParams = serializeDataTableState(currentState)
    
    // Only update if there are actual changes
    const hasChanges = 
      serializedParams.page !== searchParams.page ||
      serializedParams.pageSize !== searchParams.pageSize ||
      serializedParams.sort !== searchParams.sort ||
      JSON.stringify(serializedParams.filters) !== JSON.stringify(searchParams.filters) ||
      JSON.stringify(serializedParams.visibility) !== JSON.stringify(searchParams.visibility) ||
      serializedParams.order !== searchParams.order

    if (hasChanges) {
      setSearchParams(serializedParams)
    }
  }, [pagination, sorting, columnFilters, columnVisibility, columnOrder, searchParams, setSearchParams])

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    enableMultiSort: true,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      columnOrder,
    },
  })

  return (
    <div className="">
        <div className="pb-2 ">
            <DataTableToolbar 
              table={table} 
              tableKey={tableKey}
              deleteAction={deleteAction} 
              createAction={createAction}
              updateActionSingle={updateActionSingle}
              updateActionMulti={updateActionMulti}
              customAddForm={customAddForm}
              customEditFormSingle={customEditFormSingle}
              customEditFormMulti={customEditFormMulti}
            />
        </div>

        <div className="rounded-md border">
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                        return (
                        <TableHead key={header.id}>
                            {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                                )}
                        </TableHead>
                        )
                    })}
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                    >
                        {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                        ))}
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
        
        <div className="pt-2">
            <DataTablePagination table={table} />
        </div>
    </div>
  )
}
