import { type ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'

import { DataTableColumnHeader } from '@/components/ModsDataTableHeader'
import type { Schedule } from '@/types/server'
import { formatDateTime } from '@/lib/date'
import { getActionLabel, getStatusBadgeVariant, getStatusText } from '@/lib/schedules'

export const getColumns = (): ColumnDef<Schedule>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">{name}</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'action',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
    cell: ({ row }) => {
      const action = row.getValue('action') as string
      return (
        <Badge variant="outline" className="font-normal">
          {getActionLabel(action)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'enabled',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const enabled = row.getValue('enabled') as boolean
      return (
        <Badge variant={getStatusBadgeVariant(enabled)} className="capitalize">
          {getStatusText(enabled)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const enabled = row.getValue(id) as boolean
      return value.includes(enabled ? 'active' : 'inactive')
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as string
      return <div className="text-sm text-muted-foreground">{formatDateTime(createdAt)}</div>
    },
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => {
      const updatedAt = row.getValue('updated_at') as string
      return <div className="text-sm text-muted-foreground">{formatDateTime(updatedAt)}</div>
    },
  },
]
