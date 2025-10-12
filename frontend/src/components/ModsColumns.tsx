import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'

import { DataTableColumnHeader } from '@/components/ModsDataTableHeader'
import { ModAvatar } from '@/components/ModAvatar'
import { formatDateTime } from '@/lib/date'
import type { ModSubscription } from '@/types/mods.ts'

export const getColumns = (): ColumnDef<ModSubscription>[] => [
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
    id: 'image',
    header: '',
    cell: ({ row }) => {
      const mod = row.original
      return (
        <ModAvatar
          modId={mod.id}
          name={mod.name}
          imageAvailable={mod.imageAvailable}
          className="h-10 w-10"
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 48,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      const steamId = row.original.steamId
      return (
        <div className="max-w-[200px]">
          <div className="text-sm truncate">{name || `Mod ${steamId}`}</div>
          <div className="text-xs text-muted-foreground/70 truncate">Steam ID: {steamId}</div>
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
        <span className="text-sm text-muted-foreground max-w-[150px] truncate inline-block">
          {author || 'Unknown'}
        </span>
      )
    },
  },
  {
    accessorKey: 'modType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.getValue('modType') as ModSubscription['modType']
      const typeLabel = (type || 'mod').charAt(0).toUpperCase() + (type || 'mod').slice(1)
      return <span className="text-sm text-muted-foreground">{typeLabel}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'localPath',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Downloaded" />,
    cell: ({ row }) => {
      const localPath = row.getValue('localPath') as string | null
      const isDownloaded = localPath !== null
      return (
        <div className="flex items-center gap-1.5">
          {isDownloaded ? (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Yes</span>
            </>
          ) : (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
              <span className="text-sm text-muted-foreground/50">No</span>
            </>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const isDownloaded = row.getValue(id) !== null
      return value.includes(isDownloaded)
    },
  },
  {
    accessorKey: 'size',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Size" />,
    cell: ({ row }) => {
      const size = row.getValue('size') as string
      return <span className="text-sm text-muted-foreground">{size || '—'}</span>
    },
  },
  {
    accessorKey: 'isServerMod',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Server Mod" />,
    cell: ({ row }) => {
      const isServerMod = row.getValue('isServerMod') as boolean
      return <span className="text-sm text-muted-foreground">{isServerMod ? 'Yes' : '—'}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'lastUpdated',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
    cell: ({ row }) => {
      const lastUpdated = row.getValue('lastUpdated') as string | null
      return (
        <span className="text-sm text-muted-foreground/70">
          {lastUpdated ? formatDateTime(lastUpdated) : '—'}
        </span>
      )
    },
  },
  {
    accessorKey: 'steamLastUpdated',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Steam Updated" />,
    cell: ({ row }) => {
      const steamLastUpdated = row.getValue('steamLastUpdated') as string | null
      return (
        <span className="text-sm text-muted-foreground/70">
          {steamLastUpdated ? formatDateTime(steamLastUpdated) : '—'}
        </span>
      )
    },
  },
]
