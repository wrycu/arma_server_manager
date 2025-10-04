import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Trash, Download, Edit } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { ModSubscription } from '@/types/mods'

interface DataTableRowActionsProps {
  row: Row<ModSubscription>
  onDelete: (id: number) => Promise<void>
  onDownload: (id: number) => Promise<void>
  onEdit: (mod: ModSubscription) => void
  isLoading?: string | null
}

export function DataTableRowActions({
  row,
  onDelete,
  onDownload,
  onEdit,
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
        <DropdownMenuItem onClick={() => onEdit(mod)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDownload(mod.steamId)}
          disabled={isLoading === 'downloading' || !!mod.localPath}
        >
          <Download className="mr-2 h-4 w-4" />
          {mod.localPath ? 'Downloaded' : 'Download'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(mod.steamId)}
          disabled={isLoading === 'removing'}
          variant="destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
