# 4. Preventing Bidirectional Sync Loops

## Status

Accepted

## Context

We have bidirectional synchronization between URL params and local React state:
- Local state changes → Update URL params
- URL param changes → Update local state

This creates a risk of infinite loops:
1. Local state changes
2. Effect triggers URL update
3. URL change triggers state sync effect
4. State sync reverts local state
5. Loop repeats

Additionally, when we update the URL from local state, we don't want that URL change to immediately trigger a state sync back to local state (which would revert our change).

## Decision

We removed local state dependencies from the "sync FROM URL" effect, making it only depend on `parsedState` (which only changes when the URL actually changes).

**Implementation**:
```typescript
// Sync URL params back to state when they change externally
React.useEffect(() => {
  // Only sync when URL actually changes, not when local state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [parsedState]) // Only depend on parsedState, not local state
```

**Key Points**:
- Effect only runs when `parsedState` changes (which happens when URL actually changes)
- Does NOT run when we're the ones updating the URL from local state
- Uses ESLint disable with explanation for intentional dependency exclusion

**Change Detection**: We compare current state with URL-derived state using `JSON.stringify` before applying updates, preventing unnecessary state changes.

## Consequences

### Positive

- ✅ No infinite loops
- ✅ Stable bidirectional sync
- ✅ URL changes (browser back/forward) properly sync to state
- ✅ Local state changes properly sync to URL without triggering reverse sync

### Negative

- ⚠️ Requires ESLint disable comment (intentional, but not ideal)
- ⚠️ Relies on `JSON.stringify` for deep equality (performance consideration for very large objects)

### Trade-offs

- **Linting vs Intentional Design**: We accept the ESLint disable because we intentionally want this effect to only react to URL changes, not local state changes.
- **Simplicity vs Performance**: `JSON.stringify` works well for our use case, though specialized comparison libraries could be faster for very large/complex state objects.

## Alternatives Considered

1. **Use refs to track update source**: Track whether we're updating from local state or URL
   - Rejected: More complex, refs add cognitive overhead

2. **Single-directional sync**: Only sync state → URL, not URL → state
   - Rejected: Need URL → state for browser back/forward navigation support

3. **Use specialized comparison library**: Replace `JSON.stringify` with fast-deep-equal or similar
   - Considered for future: Acceptable trade-off for current use case

## References

- Implementation: `components/data-table/data-table.tsx` (bidirectional sync effects)
- Related: Decision #3 (Server Refresh Strategy) for URL update logic

