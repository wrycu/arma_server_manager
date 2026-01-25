import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Trash2, Filter, X, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableButton } from '@/components/DataTableButton'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { CreateCollectionDialog } from '@/components/CollectionsCreateDialog'
import type { CreateCollectionRequest } from '@/types/api'
import { ModSubscription } from '@/types/mods'
import { useDataTablePagination } from '@/hooks/useDataTablePagination'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onCreateCollection?: (collection: CreateCollectionRequest) => void
  onBatchDelete?: (steamIds: number[]) => void
  onBatchDownload?: (steamIds: number[]) => void
  onRowClick?: (row: TData) => void
  onSubscribeClick?: () => void
  tabSwitcher?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onCreateCollection,
  onBatchDelete,
  onBatchDownload,
  onRowClick,
  onSubscribeClick,
  tabSwitcher,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [createCollectionDialogOpen, setCreateCollectionDialogOpen] = React.useState(false)
  const [searchInput, setSearchInput] = React.useState('')
  const [pageSize, setPageSize] = useDataTablePagination()

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Sync pageSize from hook to table when it changes
  React.useEffect(() => {
    if (table.getState().pagination.pageSize !== pageSize) {
      table.setPageSize(pageSize)
    }
  }, [pageSize, table])

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      table.getColumn('name')?.setFilterValue(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, table])

  // Get selected mods for collection creation
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedMods: ModSubscription[] = selectedRows.map((row) => row.original as ModSubscription)
  const hasSelectedMods = selectedRows.length > 0

  const handleCreateCollection = (collection: CreateCollectionRequest) => {
    if (onCreateCollection) {
      onCreateCollection(collection)
    }
    // Clear selection after creating collection
    setRowSelection({})
  }

  const handleBatchDelete = () => {
    if (onBatchDelete) {
      const steamIds = selectedMods.map((mod) => mod.steamId)
      onBatchDelete(steamIds)
    }
    // Clear selection after deleting
    setRowSelection({})
  }

  const handleBatchDownload = () => {
    if (onBatchDownload) {
      // Only download mods that aren't already installed
      const modsToDownload = selectedMods.filter((mod) => !mod.localPath)
      const steamIds = modsToDownload.map((mod) => mod.steamId)
      if (steamIds.length > 0) {
        onBatchDownload(steamIds)
      }
    }
    // Clear selection after initiating downloads
    setRowSelection({})
  }

  // Count how many selected mods can be downloaded (not already installed)
  const downloadableModsCount = selectedMods.filter((mod) => !mod.localPath).length

  const typeFilterRaw = table.getColumn('modType')?.getFilterValue()
  const typeFilterValue = (Array.isArray(typeFilterRaw) ? typeFilterRaw[0] : typeFilterRaw) ?? 'all'
  const hasActiveFilters = searchInput || typeFilterValue !== 'all'

  const handleClearSearch = React.useCallback(() => {
    setSearchInput('')
    table.getColumn('name')?.setFilterValue('')
  }, [table])

  const handleClearAllFilters = React.useCallback(() => {
    setSearchInput('')
    table.getColumn('name')?.setFilterValue('')
    table.getColumn('modType')?.setFilterValue('all')
  }, [table])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center">{tabSwitcher}</div>
        <div className="flex items-center gap-2">
          {hasSelectedMods && (
            <>
              <DataTableButton onClick={() => setCreateCollectionDialogOpen(true)}>
                Create Collection
              </DataTableButton>
              {onBatchDownload && downloadableModsCount > 0 && (
                <DataTableButton onClick={handleBatchDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download ({downloadableModsCount})
                </DataTableButton>
              )}
              {onBatchDelete && (
                <DataTableButton variant="destructive" onClick={handleBatchDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedRows.length})
                </DataTableButton>
              )}
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 gap-1 text-muted-foreground hover:text-foreground data-[state=open]:bg-accent',
                  hasActiveFilters && 'text-foreground'
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                {hasActiveFilters && <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Search</label>
                  <div className="relative">
                    <Input
                      placeholder="Filter by name..."
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      className="h-8 text-sm pr-8"
                    />
                    {searchInput && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <Select
                    value={typeFilterValue}
                    onValueChange={(value) =>
                      table.getColumn('modType')?.setFilterValue(value === 'all' ? '' : [value])
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="mod">Mods</SelectItem>
                      <SelectItem value="mission">Missions</SelectItem>
                      <SelectItem value="map">Maps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <div className="border-t pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={handleClearAllFilters}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {onSubscribeClick && <DataTableButton onClick={onSubscribeClick}>New</DataTableButton>}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        // Prevent row click when clicking on interactive elements
                        const target = e.target as HTMLElement
                        if (
                          target.closest('button') ||
                          target.closest('input[type="checkbox"]') ||
                          target.closest('[role="button"]')
                        ) {
                          e.stopPropagation()
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              const newPageSize = Number(value)
              setPageSize(newPageSize)
              table.setPageSize(newPageSize)
            }}
          >
            <SelectTrigger className="h-8 w-[70px] border-0 bg-transparent hover:bg-muted/50">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[20, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CreateCollectionDialog
        open={createCollectionDialogOpen}
        onOpenChange={setCreateCollectionDialogOpen}
        onCreate={handleCreateCollection}
        selectedMods={selectedMods.map((mod) => mod.id)}
      />
    </div>
  )
}
