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
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'

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

import type { Collection } from '@/types/collections'
import { CreateCollectionDialog } from '@/components/CollectionsCreateDialog'

export interface CollectionsDataTableProps {
  columns: ColumnDef<Collection>[]
  data: Collection[]
  isLoading?: boolean
  onRowClick?: (collection: Collection) => void
  onCreateCollection?: (data: { name: string; description: string }) => void
  isCreating?: boolean
  tabSwitcher?: React.ReactNode
}

export function CollectionsDataTable(props: CollectionsDataTableProps) {
  const {
    columns,
    data,
    isLoading = false,
    onRowClick,
    onCreateCollection,
    isCreating: _isCreating = false,
    tabSwitcher,
  } = props
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [searchInput, setSearchInput] = React.useState('')

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      table.getColumn('name')?.setFilterValue(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, table])

  const hasActiveFilters = searchInput

  const handleClearSearch = React.useCallback(() => {
    setSearchInput('')
    table.getColumn('name')?.setFilterValue('')
  }, [table])

  const handleClearAllFilters = React.useCallback(() => {
    setSearchInput('')
    table.getColumn('name')?.setFilterValue('')
  }, [table])

  const handleCreateCollection = async (collectionData: { name: string; description: string }) => {
    if (onCreateCollection) {
      try {
        await onCreateCollection(collectionData)
        setCreateDialogOpen(false)
      } catch (error) {
        console.error('Failed to create collection:', error)
      }
    }
  }

  // Only show skeleton on first load with no data
  // If we have data (even stale), keep the table visible
  if (isLoading && data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-[250px] bg-muted rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-[100px] bg-muted rounded animate-pulse" />
            <div className="h-10 w-[120px] bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="rounded-md border">
          <div className="h-12 border-b bg-muted/30 animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b bg-muted/10 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center">{tabSwitcher}</div>
        <div className="flex items-center gap-2">
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
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          )}
          {onCreateCollection && (
            <CreateCollectionDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              onCreate={handleCreateCollection}
              trigger={<DataTableButton>New</DataTableButton>}
            />
          )}
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
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No collections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px] border-0 bg-transparent hover:bg-muted/50">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
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
    </div>
  )
}
