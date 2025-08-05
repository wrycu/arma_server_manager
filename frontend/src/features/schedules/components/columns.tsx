import { type ColumnDef } from '@tanstack/react-table';
import { Play, Trash2, MoreHorizontal, Edit3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { DataTableColumnHeader } from '../../mods/components/DataTableColumnHeader';
import type { Schedule } from '../../server/types';

interface GetColumnsProps {
  onExecute: (id: number) => Promise<void>;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: number) => Promise<void>;
  isLoading: boolean;
}

const operationTypes = {
  restart: 'Restart',
  backup: 'Backup',
  mod_update: 'Update',
  stop: 'Stop',
  start: 'Start',
} as const;

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'paused':
      return 'secondary';
    case 'inactive':
      return 'outline';
    default:
      return 'outline';
  }
};

function formatNextRun(nextRun: string): string {
  const date = new Date(nextRun);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs < 0) return 'Overdue';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  return `${Math.floor(diffMs / (1000 * 60))}m`;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
        const name = row.getValue('name') as string;
        return (
          <div className="max-w-[200px]">
            <div className="font-medium truncate">{name}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'operationType',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Operation" />,
      cell: ({ row }) => {
        const operationType = row.getValue(
          'operationType'
        ) as keyof typeof operationTypes;
        return (
          <Badge variant="outline" className="font-normal">
            {operationTypes[operationType]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'frequency',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Frequency" />,
      cell: ({ row }) => {
        const frequency = row.getValue('frequency') as string;
        return <div className="text-sm font-mono text-muted-foreground">{frequency}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'nextRun',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Next Run" />,
      cell: ({ row }) => {
        const nextRun = row.getValue('nextRun') as string;
        if (!nextRun) return <span className="text-muted-foreground">-</span>;

        const isOverdue = new Date(nextRun) < new Date();

        return (
          <div className="text-sm">
            <div className="font-medium">{formatDateTime(nextRun)}</div>
            <div
              className={`text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {formatNextRun(nextRun)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'lastRun',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Run" />,
      cell: ({ row }) => {
        const lastRun = row.getValue('lastRun') as string;
        if (!lastRun) return <span className="text-muted-foreground">Never</span>;

        return (
          <div className="text-sm text-muted-foreground">{formatDateTime(lastRun)}</div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const schedule = row.original;

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
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
