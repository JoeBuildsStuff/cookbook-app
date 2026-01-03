import {
  parseAsInteger,
  parseAsString,
  parseAsJson,
  createSearchParamsCache,
  createLoader,
} from "nuqs/server";
import type { PaginationState, SortingState, ColumnFiltersState, VisibilityState, ColumnOrderState } from "@tanstack/react-table";

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

/**
 * Search params configuration for data table using nuqs
 * This provides type-safe parsing and serialization of URL search parameters
 */
export const dataTableSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(50),
  sort: parseAsString,
  filters: parseAsJson<ColumnFiltersState>(isValidColumnFiltersState),
  visibility: parseAsJson<VisibilityState>(isValidVisibilityState),
  order: parseAsString,
} as const;

/**
 * Create a search params cache for server-side parsing
 * This cache can be used in server components to access search params
 */
export const dataTableSearchParamsCache = createSearchParamsCache(dataTableSearchParams);

export type ParsedDataTableSearchParams = Awaited<
  ReturnType<typeof dataTableSearchParamsCache.parse>
>;

/**
 * Loader helper for scenarios outside of the RSC cache (eg. route handlers)
 */
export const loadDataTableSearchParams = createLoader(dataTableSearchParams);

/**
 * Parse search params into DataTableState format
 */
export function parseDataTableSearchParams(params: {
  page?: number | null;
  pageSize?: number | null;
  sort?: string | null;
  filters?: ColumnFiltersState | null;
  visibility?: VisibilityState | null;
  order?: string | null;
}): {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
} {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;

  // Parse sorting: format is "id:asc,id2:desc"
  let sorting: SortingState = [];
  if (params.sort) {
    try {
      sorting = params.sort.split(',').map(sort => {
        const [id, desc] = sort.split(':');
        return {
          id,
          desc: desc === 'desc'
        };
      });
    } catch {
      sorting = [];
    }
  }

  // Parse filters
  const columnFilters: ColumnFiltersState = params.filters ?? [];

  // Parse column visibility
  const columnVisibility: VisibilityState = params.visibility ?? {};

  // Parse column order
  const columnOrder: ColumnOrderState = params.order ? params.order.split(",") : [];

  return {
    pagination: {
      pageIndex: Math.max(0, page - 1), // Convert 1-indexed to 0-indexed
      pageSize: Math.max(1, pageSize),
    },
    sorting,
    columnFilters,
    columnVisibility,
    columnOrder,
  };
}

/**
 * Serialize DataTableState to search params format
 */
export function serializeDataTableState(state: {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
}): {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: ColumnFiltersState;
  visibility?: VisibilityState;
  order?: string;
} {
  const params: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: ColumnFiltersState;
    visibility?: VisibilityState;
    order?: string;
  } = {};

  // Serialize pagination
  if (state.pagination.pageIndex > 0) {
    params.page = state.pagination.pageIndex + 1; // Convert 0-indexed to 1-indexed
  }
  if (state.pagination.pageSize !== 50) {
    params.pageSize = state.pagination.pageSize;
  }

  // Serialize sorting
  if (state.sorting.length > 0) {
    params.sort = state.sorting
      .map(sort => `${sort.id}:${sort.desc ? 'desc' : 'asc'}`)
      .join(',');
  }

  // Serialize filters
  if (state.columnFilters.length > 0) {
    params.filters = state.columnFilters;
  }

  // Serialize column visibility (only if columns are hidden)
  const hiddenColumns = Object.entries(state.columnVisibility).filter(([, visible]) => !visible);
  if (hiddenColumns.length > 0) {
    params.visibility = state.columnVisibility;
  }

  // Serialize column order
  if (state.columnOrder?.length > 0) {
    params.order = state.columnOrder.join(",");
  }

  return params;
}

