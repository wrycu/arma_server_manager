import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { IconUser, IconPuzzle, IconFlag, IconMap } from '@tabler/icons-react'

import { DataTableColumnHeader } from '@/components/ModsDataTableHeader'
import { DataTableRowActions } from '@/components/ModsDataRowActions'
import type { ModSubscription } from '@/types/mods.ts'

interface GetColumnsProps {
  onUpdate: (id: number) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onDownload: (id: number) => Promise<void>
  isLoading?: string | null
}

const getTypeIcon = (type: ModSubscription['modType']) => {
  switch (type) {
    case 'mod':
      return <IconPuzzle className="h-3 w-3 text-muted-foreground" />
    case 'mission':
      return <IconFlag className="h-3 w-3 text-muted-foreground" />
    case 'map':
      return <IconMap className="h-3 w-3 text-muted-foreground" />
    default:
      return <IconPuzzle className="h-3 w-3 text-muted-foreground" />
  }
}

const getTypeBadgeVariant = (type: ModSubscription['modType']) => {
  switch (type) {
    case 'mod':
      return 'default'
    case 'mission':
      return 'secondary'
    case 'map':
      return 'outline'
    default:
      return 'default'
  }
}

export const getColumns = ({
  onUpdate,
  onDelete,
  onDownload,
  isLoading,
}: GetColumnsProps): ColumnDef<ModSubscription>[] => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
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
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const name = row.getValue('name') as string
        const steamId = row.original.steamId
        return (
          <div className="max-w-[200px]">
            <div className="font-medium">{name || `Mod ${steamId}`}</div>
            <div className="text-xs text-muted-foreground">Steam ID: {steamId}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'author',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
      cell: ({ row }) => {
        const author = row.getValue('author') as string
        return (
          <div className="flex items-center gap-2">
            <IconUser className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{author || 'Unknown'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const type = row.getValue('modType') as ModSubscription['modType']
        return (
          <div className="flex items-center gap-2">
            {getTypeIcon(type || 'mod')}
            <Badge variant={getTypeBadgeVariant(type || 'mod')} className="text-xs">
              {(type || 'mod').charAt(0).toUpperCase() + (type || 'mod').slice(1)}
            </Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'size',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Size" />,
      cell: ({ row }) => {
        const size = row.getValue('size') as string
        return <div className="text-sm">{size || 'Unknown'}</div>
      },
    },
    {
      accessorKey: 'lastUpdated',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
      cell: ({ row }) => {
        const lastUpdated = row.getValue('lastUpdated') as string
        if (!lastUpdated) return <div className="text-sm text-muted-foreground">—</div>

        const date = new Date(lastUpdated)
        return <div className="text-sm">{date.toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: 'shouldUpdate',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const hasUpdate = row.getValue('shouldUpdate') as boolean
        return (
          <Badge variant={hasUpdate ? 'destructive' : 'secondary'} className="text-xs">
            {hasUpdate ? 'Update Available' : 'Up to Date'}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        const hasUpdate = row.getValue(id) as boolean
        if (value === 'all') return true
        if (value === 'updates') return hasUpdate
        if (value === 'current') return !hasUpdate
        return true
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDownload={onDownload}
          isLoading={isLoading}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
