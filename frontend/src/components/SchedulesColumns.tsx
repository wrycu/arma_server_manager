import { type ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/ModsDataTableHeader'
import type { Schedule } from '@/types/server'
import { formatDateTime } from '@/lib/date'
import { getActionLabel, getStatusText } from '@/lib/schedules'

export const getColumns = (): ColumnDef<Schedule>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return (
        <div className="max-w-[200px]">
          <div className="text-sm truncate">{name}</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'action',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
    cell: ({ row }) => {
      const action = row.getValue('action') as string
      return <span className="text-sm text-muted-foreground">{getActionLabel(action)}</span>
    },
  },
  {
    accessorKey: 'enabled',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const enabled = row.getValue('enabled') as boolean
      return (
        <div className="flex items-center gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
          />
          <span
            className={`text-sm ${enabled ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}
          >
            {getStatusText(enabled)}
          </span>
        </div>
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
      return <span className="text-sm text-muted-foreground/70">{formatDateTime(createdAt)}</span>
    },
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => {
      const updatedAt = row.getValue('updated_at') as string
      return <span className="text-sm text-muted-foreground/70">{formatDateTime(updatedAt)}</span>
    },
  },
]
