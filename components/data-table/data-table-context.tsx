"use client"

import * as React from "react"
import type { SortingState } from "@tanstack/react-table"

export const DataTableSortingContext = React.createContext<SortingState>([])

export function useDataTableSorting() {
  return React.useContext(DataTableSortingContext)
}

