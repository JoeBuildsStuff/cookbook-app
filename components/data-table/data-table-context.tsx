"use client"

import * as React from "react"
import { SortingState } from "@tanstack/react-table"

const DataTableSortingContext = React.createContext<SortingState>([])

export { DataTableSortingContext }

export function useDataTableSorting() {
  const context = React.useContext(DataTableSortingContext)
  if (context === undefined) {
    throw new Error("useDataTableSorting must be used within a DataTableSortingContext.Provider")
  }
  return context
}
