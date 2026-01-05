# 2. URL Parameter Removal Strategy

## Status

Accepted

## Context

When filters or sorts were removed, the URL parameters weren't cleared. On page refresh, the old parameters would be re-read and re-applied, causing removed filters/sorts to reappear. This broke user expectations - removing a filter should persist that removal.

Additionally, when navigating backward in pagination (e.g., from page 2 to page 1), the `page` parameter wasn't being removed from the URL. This caused the URL to still show `?page=2` even though the table was displaying page 1, and on refresh it would jump back to page 2.

The `nuqs` library manages URL search parameters, but we needed to understand how to properly remove parameters when state becomes empty or returns to default values.

## Decision

We explicitly set parameters to `null` when arrays/objects are empty, rather than using `undefined` or omitting the parameter.

**Implementation**:
```typescript
// In data-table.tsx useEffect
const updateParams = { ...serializedParams } as {
  page?: number | null;
  pageSize?: number | null;
  sort?: string | null;
  filters?: ColumnFiltersState | null;
  visibility?: VisibilityState | null;
  order?: string | null;
}
// Remove page param when going to page 1 (index 0)
if (pagination.pageIndex === 0 && searchParams.page) {
  updateParams.page = null
}
// Remove pageSize param when it's the default (50)
if (pagination.pageSize === 50 && searchParams.pageSize) {
  updateParams.pageSize = null
}
if (sorting.length === 0) updateParams.sort = null
if (columnFilters.length === 0) updateParams.filters = null
// ... etc
setSearchParams(updateParams)
```

**Key Insight**: `nuqs` requires explicit `null` values (not `undefined`) to remove query parameters from the URL.

We used explicit type casting to allow `null` values, as the `serializeDataTableState` return type doesn't include `null` (it returns `undefined` for empty states), but `nuqs` requires `null` for parameter removal.

## Consequences

### Positive

- ✅ URL parameters are properly removed when state is cleared
- ✅ Page refreshes maintain the cleared state
- ✅ Removed filters/sorts don't reappear unexpectedly
- ✅ URL stays clean and reflects actual table state

### Negative

- ⚠️ Requires explicit type casting (mild type safety concern)
- ⚠️ Must remember to set to `null` rather than `undefined` for each parameter

### Trade-offs

- **Type Safety vs Practicality**: We accept the type casting workaround because `nuqs`'s API requires `null` for removal, and this is a known pattern in the library.

## References

- Implementation: `components/data-table/data-table.tsx` (state-to-URL sync effect)
- Library: [nuqs](https://github.com/47ng/nuqs)

