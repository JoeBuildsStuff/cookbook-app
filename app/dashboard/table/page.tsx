import DataTableTable from "./_components/table"

export default async function DataTableTablePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  return (
    <main className="">
      <DataTableTable searchParams={params} />
    </main>
  )
}