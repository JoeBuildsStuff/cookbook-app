# Data Table

The reusable `DataTable` client component at `src/components/data-table/data-table.tsx` wraps TanStack Table with our project defaults (saved views, CRUD actions, pagination, filters, etc.). It keeps pagination, sorting, filter, column visibility, and ordering settings in sync with the URL `searchParams` so server components can pass state straight from the request.

## When to Use
- Rendering tabular data that should persist UI state across navigation or reloads.
- Supporting server-driven pagination, filtering, and sorting.
- Opting into built-in toolbar actions (create, update, delete) and saved views keyed by `tableKey`.

## Server Component Wiring
Use a server component to read the incoming `searchParams`, hydrate any data loaders, and pass the params to your table wrapper. The wrapper can then forward the parsed state to `<DataTable />` via `initialState`.

```tsx
import DataTableMeetings from "@/app/(workspace)/workspace/meetings/_components/table";

export default async function DataTableMeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  return (
    <div className="w-full">
      <DataTableMeetings searchParams={params} />
    </div>
  )
}
```

The `DataTableMeetings` server component (see `src/app/(workspace)/workspace/meetings/_components/table.tsx`) uses helpers from `@/lib/data-table` to parse the URL state, fetch rows, and provide an `initialState` back to the client table.

```tsx
import type { SearchParams } from "nuqs/server"
import {
  dataTableSearchParamsCache,
  parseDataTableSearchParams,
} from "@/lib/data-table-search-params"
import { getMeetingsList } from "../../meetings/[id]/_lib/queries"

interface DataTableMeetingsProps {
  searchParams: Promise<SearchParams>
}

export default async function DataTableMeetings({
  searchParams,
}: DataTableMeetingsProps) {
  const parsedSearchParams = await dataTableSearchParamsCache.parse(searchParams)
  const initialState = parseDataTableSearchParams(parsedSearchParams)
  const { data, count, error } = await getMeetingsList(parsedSearchParams)

  // ... pass data + derived state into <DataTable />
}
```

Within the query helpers you can reuse `parseDataTableSearchParams` to keep pagination, sorting, and filter logic aligned with the client state:

```ts
import { createClient } from "@/lib/supabase/server"
import {
  loadDataTableSearchParams,
  type ParsedDataTableSearchParams,
  parseDataTableSearchParams,
} from "@/lib/data-table-search-params"

export async function getMeetingsList(
  searchParams: ParsedDataTableSearchParams | URLSearchParams
) {
  const supabase = await createClient()
  const parsed =
    searchParams instanceof URLSearchParams
      ? loadDataTableSearchParams(searchParams)
      : searchParams
  const { pagination, sorting, columnFilters } = parseDataTableSearchParams(parsed)

  // ...apply pagination, sorting, filters directly in your Supabase query
}
```

## Client Props Recap
`<DataTable />` accepts:
- `columns` – TanStack column definitions.
- `data` – the row data set.
- `pageCount` – total page count for server pagination.
- `initialState` – optional state derived from `searchParams`.
- `tableKey` – unique key for persisting saved views.
- Optional CRUD handlers (`createAction`, `updateActionSingle`, `updateActionMulti`, `deleteAction`) and custom add/edit forms.

Whenever the client component mutates table state, it serializes the new values with `serializeDataTableState` (see `lib/data-table-search-params.ts`) and merges them into the current `searchParams` via `router.replace`. This keeps the URL authoritative for future requests.

## Tips
- Use the `SearchParams` type from `nuqs/server` for strong typing on server components.
- Adjust default column visibility or page size by merging values into the `initialState` you pass down.
- Because the table performs manual sorting/pagination/filtering, ensure your data fetcher respects the parsed state when querying Supabase.

## Documentation

- **[CHANGELOG.md](./docs/CHANGELOG.md)**: List of all changes, fixes, and features
- **[Architecture Decision Records](./docs/decisions/README.md)**: Detailed documentation of architectural decisions and their rationale

Key architectural decisions:
- State synchronization strategy (props vs context) - [ADR-0001](./docs/decisions/0001-state-synchronization-strategy.md)
- URL parameter removal strategy - [ADR-0002](./docs/decisions/0002-url-parameter-removal-strategy.md)
- Server component refresh strategy - [ADR-0003](./docs/decisions/0003-server-refresh-strategy.md)
- Preventing sync loops - [ADR-0004](./docs/decisions/0004-preventing-sync-loops.md)
