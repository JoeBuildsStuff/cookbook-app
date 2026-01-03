"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Column, Table, Row } from "@tanstack/react-table"
import { 
  IdCard, 
  Mail, 
  Calendar, 
  User, 
  Building2, 
  Briefcase, 
  Phone, 
  Heart, 
  Tag, 
  FileText, 
  Hash,
  Clock,
  Cake
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export type DataTableRow = {
  idx: number
  id: string
  name: string
  firstName: string
  lastName: string
  nickname: string | null
  email: string
  phone: string
  age: number
  birthday: string
  company: string
  jobTitle: string
  notes: string
  isFavorite: boolean
  tags: string[]
  registered: string
  updatedAt: string
}

export const columns = [
    {
      id: "select",
      header: ({ table }: { table: Table<DataTableRow> }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: Row<DataTableRow> }) => (
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
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader 
          column={column} 
          title="IDX" 
          icon={<Hash className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "idx",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader 
          column={column} 
          title="ID" 
          icon={<Hash className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "id",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
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
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader 
          column={column} 
          title="First Name" 
          icon={<User className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "firstName",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Last Name" 
          icon={<User className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "lastName",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Nickname" 
          icon={<User className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "nickname",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Email" 
          icon={<Mail className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "email",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Phone" 
          icon={<Phone className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "phone",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title="Age"
          icon={<User className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "age",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title="Birthday"
          icon={<Cake className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "birthday",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title="Company"
          icon={<Building2 className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "company",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title="Job Title"
          icon={<Briefcase className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "jobTitle",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title="Notes"
          icon={<FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "notes",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title="Favorite"
          icon={<Heart className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "isFavorite",
      enableColumnFilter: true,
      cell: ({ row }: { row: Row<DataTableRow> }) => (
        row.original.isFavorite ? (
          <Heart className="size-4 text-red-500 fill-red-500" />
        ) : (
          <Heart className="size-4 text-muted-foreground" />
        )
      ),
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title="Tags"
          icon={<Tag className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "tags",
      enableColumnFilter: true,
      cell: ({ row }: { row: Row<DataTableRow> }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title="Registered"
          icon={<Calendar className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "registered",
      enableColumnFilter: true,
    },
    {
      header: ({ column }: { column: Column<DataTableRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title="Updated At"
          icon={<Clock className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
        />
      ),
      accessorKey: "updatedAt",
      enableColumnFilter: true,
    },
]