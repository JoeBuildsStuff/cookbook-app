"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Column, Table } from "@tanstack/react-table"
import { IdCard, Mail } from "lucide-react"

export const columns = [
    {
    id: "select",
    header: ({ table }: { table: Table<{ name: string; email: string }> }) => (
    <Checkbox
    checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
    }
    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    aria-label="Select all"
    />
    ),
    cell: ({ row }) => (
    <Checkbox
    checked={row.getIsSelected()}
    onCheckedChange={(value) => row.toggleSelected(!!value)}
    aria-label="Select row"
    />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
    excludeFromForm: true,
    },
    },    
  {
    header: ({ column }: { column: Column<{ name: string; email: string }, unknown> }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Name" 
          icon={<IdCard className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
    accessorKey: "name",
    enableColumnFilter: true,
  },

  {
    header: ({ column }: { column: Column<{ name: string; email: string }, unknown> }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Email" 
          icon={<Mail className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
    accessorKey: "email",
    enableColumnFilter: true,
  },
]