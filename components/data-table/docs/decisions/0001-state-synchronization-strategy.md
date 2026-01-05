# 1. State Synchronization Strategy

## Status

Accepted

## Context

When filters or sorts were applied via the UI components (`DataTableSort`, `DataTableFilter`), the visual indicators (badges, pills, column headers) wouldn't update until a manual page refresh. This created a poor user experience where the UI felt unresponsive.

The table components were polling `table.getState()` to check for changes, which caused:
- Stale UI state that didn't reflect applied filters/sorts
- Performance overhead from repeated state polling
- Inconsistent visual feedback for users

## Decision

We implemented a prop-based state passing strategy combined with React Context:

1. **Prop-based flow for filters**: Pass `columnFilters` state from `DataTable` → `DataTableToolbar` → `DataTableFilter` & `DataTableCommandFilter`
2. **Prop-based flow for pagination**: Pass `pagination` and `rowSelection` state from `DataTable` → `DataTablePagination`
3. **Context-based flow for sorting**: Create `DataTableSortingContext` to share sorting state with deeply nested column headers
4. **Remove polling**: Modified components to consume live state props/context instead of polling `table.getState()`

**Files Modified**:
- `data-table.tsx`: Added state props to toolbar and pagination, wrapped table in context provider
- `data-table-toolbar.tsx`: Accepts and forwards `sorting` and `columnFilters` props
- `data-table-sort.tsx`: Consumes `sorting` prop for badge count and sync logic
- `data-table-filter.tsx`: Consumes `columnFilters` prop for badge count and sync logic
- `data-table-column-header.tsx`: Uses `useDataTableSorting()` hook to show sort direction
- `data-table-command-filter.tsx`: Consumes `columnFilters` prop for real-time pill updates
- `data-table-pagination.tsx`: Consumes `pagination` and `rowSelection` props for live state display
- `data-table-context.tsx`: New context provider for sorting state

## Consequences

### Positive

- ✅ Real-time UI updates without page refresh
- ✅ Better performance (no polling overhead)
- ✅ Consistent visual feedback across all components
- ✅ Clear data flow that's easier to debug

### Negative

- ⚠️ More prop drilling for filters (mitigated by using Context for sorting where nesting is deep)
- ⚠️ Slightly more complex component APIs (components now require state props)

### Trade-offs

- **Props vs Context**: Used React Context for sorting state because it's accessed by deeply nested column headers, while filters are passed as props through the toolbar hierarchy. This balances prop drilling concerns with component coupling.

## References

- Implementation: `components/data-table/data-table.tsx`
- Context: `components/data-table/data-table-context.tsx`

