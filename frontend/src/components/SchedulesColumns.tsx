import { type ColumnDef } from '@tanstack/react-table'
import { Play, Trash2, MoreHorizontal, Edit3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { DataTableColumnHeader } from '@/components/ModsDataTableHeader'
import type { Schedule } from '@/types/server'
import { formatDateTime } from '@/lib/date'
import { getActionLabel, getStatusBadgeVariant, getStatusText } from '@/lib/schedules'

interface GetColumnsProps {
  onExecute: (id: number) => Promise<void>
  onEdit: (schedule: Schedule) => void
  onDelete: (id: number) => Promise<void>
  isLoading: boolean
}

export const getColumns = ({
  onExecute,
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<Schedule>[] => [
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
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const schedule = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExecute(schedule.id)}>
                <Play className="mr-2 h-4 w-4" />
                Execute Now
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(schedule)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Schedule
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(schedule.id)}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
