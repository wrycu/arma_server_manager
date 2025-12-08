import { type ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/ModsDataTableHeader'
import type { Collection } from '@/types/collections'

export const getColumns = (activeCollectionId?: number | null): ColumnDef<Collection>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Collection" />,
    cell: ({ row }) => {
      const collection = row.original
      return (
        <div className="max-w-[300px] space-y-1">
          <div className="text-sm font-medium truncate">{collection.name}</div>
          <p className="text-xs text-muted-foreground truncate">{collection.description}</p>
        </div>
      )
    },
  },
  {
    accessorKey: 'mods',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mods" />,
    cell: ({ row }) => {
      const modsCount = row.original.mods?.length || 0
      return (
        <span className="text-sm text-muted-foreground">
          {modsCount} {modsCount === 1 ? 'mod' : 'mods'}
        </span>
      )
    },
  },
  {
    id: 'active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
    cell: ({ row }) => {
      const collection = row.original
      const isActive = activeCollectionId === collection.id
      return (
        <div className="flex items-center gap-1.5">
          {isActive ? (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Active</span>
            </>
          ) : (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
              <span className="text-sm text-muted-foreground/50">Inactive</span>
            </>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 100,
  },
]
