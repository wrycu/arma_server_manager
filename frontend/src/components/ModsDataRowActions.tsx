import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { ModSubscription } from '@/types/mods'

interface DataTableRowActionsProps {
  row: Row<ModSubscription>
  onDelete: (id: number) => Promise<void>
  isLoading?: string | null
}

export function DataTableRowActions({
  row,
  onDelete,
  isLoading,
}: DataTableRowActionsProps) {
  const mod = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => onDelete(mod.steamId)}
          disabled={isLoading === 'removing'}
          className="text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
