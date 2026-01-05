# 2. URL Parameter Removal Strategy

## Status

Accepted

## Context

When filters or sorts were removed, the URL parameters weren't cleared. On page refresh, the old parameters would be re-read and re-applied, causing removed filters/sorts to reappear. This broke user expectations - removing a filter should persist that removal.

The `nuqs` library manages URL search parameters, but we needed to understand how to properly remove parameters when state becomes empty.

## Decision

We explicitly set parameters to `null` when arrays/objects are empty, rather than using `undefined` or omitting the parameter.

**Implementation**:
```typescript
// In data-table.tsx useEffect
const updateParams = { ...serializedParams } as {
  sort?: string | null;
  filters?: ColumnFiltersState | null;
  visibility?: VisibilityState | null;
  order?: string | null;
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

