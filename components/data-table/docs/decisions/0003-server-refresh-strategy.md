# 3. Server Component Refresh Strategy

## Status

Accepted (with known optimization opportunity)

## Context

When URL parameters changed in the client-side DataTable component, Next.js server components weren't automatically re-rendering to fetch new data. This meant that filter/sort changes would update the URL but the server wouldn't refetch data with the new parameters.

In Next.js App Router, server components run during the initial request, but subsequent client-side URL changes don't automatically trigger server re-renders unless explicitly requested.

## Decision

We implemented a manual `router.refresh()` call after URL parameter updates, using a ref to track when refresh is needed and prevent duplicate refreshes.

**Implementation**:
```typescript
// Track when URL update happens
shouldRefreshRef.current = true
setSearchParams(updateParams)

// Separate effect to refresh router
React.useEffect(() => {
  if (shouldRefreshRef.current) {
    shouldRefreshRef.current = false
    router.refresh()
  }
}, [searchParams, router])
```

**Rationale**: Separated the refresh logic into its own effect to avoid race conditions and ensure it only runs after URL params have actually updated.

## Consequences

### Positive

- ✅ Server components re-fetch data when table state changes
- ✅ Data stays in sync with URL parameters
- ✅ Prevents duplicate refreshes with ref guard
- ✅ Works reliably with Next.js App Router

### Negative

- ⚠️ Potential double-fetch: Both `nuqs` with `shallow: false` AND manual `router.refresh()` may trigger server requests
- ⚠️ Extra complexity with ref tracking

### Known Issues

**Double-Fetch Problem**: When `useQueryStates` is configured with `shallow: false`, it triggers Next.js navigation which can cause a server render. Combined with our manual `router.refresh()`, this may result in two server requests per filter/sort change.

**Recommendation**: Set `shallow: true` in `useQueryStates` configuration and rely solely on manual `router.refresh()` for explicit control. This ensures only one server request per state change.

## Alternatives Considered

1. **Rely on `nuqs` automatic navigation**: Remove `router.refresh()` and let `shallow: false` handle it
   - Rejected: Less explicit control, harder to debug

2. **Use `router.push` instead**: Manually navigate with new URL
   - Rejected: More boilerplate, `nuqs` handles URL construction better

## References

- Implementation: `components/data-table/data-table.tsx` (refresh effect)
- See also: Decision #4 for related sync loop prevention

