import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import {
  IconFolder,
  IconGripVertical,
  IconTrash,
  IconServer,
  IconDownload,
} from '@tabler/icons-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragCancelEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item'
import type { ModSubscription } from '@/types/mods'
import { ModAvatar } from '@/components/ModAvatar'
import { getModStatus, type ModStatusInfo } from '@/lib/modStatus'

interface ModsListProps {
  mods: ModSubscription[]
  collectionId: number
  searchQuery?: string
  onRemoveMod: (collectionId: number, modId: number, modName: string) => void
  onModClick?: (mod: ModSubscription) => void
  onReorderMod?: (collectionId: number, modId: number, newPosition: number) => Promise<void>
  onDownload?: (steamId: number) => void
}

interface SortableModItemProps {
  mod: ModSubscription
  collectionId: number
  onRemoveMod: (collectionId: number, modId: number, modName: string) => void
  onModClick?: (mod: ModSubscription) => void
  onDownload?: (steamId: number) => void
}

interface ModStatusIndicatorProps {
  status: ModStatusInfo
}

const ModStatusIndicator = memo(function ModStatusIndicator({ status }: ModStatusIndicatorProps) {
  const Icon = status.icon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex items-center"
          role="status"
          aria-label={status.label}
          data-testid={`mod-status-${status.type}`}
        >
          <Icon className={status.iconClassName} aria-hidden="true" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">{status.label}</TooltipContent>
    </Tooltip>
  )
})

const SortableModItem = memo(function SortableModItem({
  mod,
  collectionId,
  onRemoveMod,
  onModClick,
  onDownload,
}: SortableModItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: mod.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const modStatus = useMemo(() => getModStatus(mod), [mod])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/sortable flex items-start"
      data-testid={`mod-item-${mod.id}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover/sortable:opacity-100 cursor-grab active:cursor-grabbing transition-opacity duration-150 flex items-center justify-center w-8 h-6 shrink-0 mt-2"
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
        data-testid={`mod-drag-handle-${mod.id}`}
      >
        <IconGripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <Item
        variant="muted"
        size="sm"
        className="cursor-pointer w-full max-w-3xl py-2 bg-muted border border-border group"
        onClick={() => onModClick?.(mod)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onModClick?.(mod)
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Mod: ${mod.name}`}
        data-testid={`mod-item-button-${mod.id}`}
      >
        <ItemMedia>
          <ModAvatar
            modId={mod.id}
            name={mod.name}
            imageAvailable={mod.imageAvailable}
            className="h-8 w-8"
          />
        </ItemMedia>

        <ItemContent>
          <ItemTitle>{mod.name}</ItemTitle>
          <ItemDescription>
            <div className="flex items-center gap-2" data-testid={`mod-status-container-${mod.id}`}>
              <ModStatusIndicator status={modStatus} />
              {mod.isServerMod && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex items-center"
                      role="img"
                      aria-label="Server-side mod"
                      data-testid={`mod-server-indicator-${mod.id}`}
                    >
                      <IconServer
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">Server-side mod</TooltipContent>
                </Tooltip>
              )}
            </div>
          </ItemDescription>
        </ItemContent>

        <ItemActions>
          {!mod.localPath && onDownload && (
            <Button
              variant="ghost"
              size="inline"
              className="opacity-0 group-hover:opacity-100 transition-all hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:text-yellow-500"
              onClick={(e) => {
                e.stopPropagation()
                onDownload(mod.steamId)
              }}
              title="Download mod"
              disabled={mod.status === 'install_requested'}
              aria-label="Download mod"
              data-testid={`mod-download-button-${mod.id}`}
            >
              <IconDownload className="h-3 w-3" aria-hidden="true" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="inline"
            className="w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onRemoveMod(collectionId, mod.id, mod.name)
            }}
            aria-label="Remove from collection"
            title="Remove from collection"
            data-testid={`mod-remove-button-${mod.id}`}
          >
            <IconTrash className="h-3 w-3" aria-hidden="true" />
          </Button>
        </ItemActions>
      </Item>
    </div>
  )
})

export function ModsList({
  mods,
  collectionId,
  searchQuery = '',
  onRemoveMod,
  onModClick,
  onReorderMod,
  onDownload,
}: ModsListProps) {
  const [items, setItems] = useState(mods)
  const [activeId, setActiveId] = useState<number | null>(null)

  // Filter mods based on search query
  const filteredMods = useMemo(
    () => mods.filter((mod) => mod.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [mods, searchQuery]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Sync from props when mod IDs change or when mod data changes
  useEffect(() => {
    // Don't update during drag
    if (activeId) return

    setItems((currentItems) => {
      const currentIds = currentItems
        .map((item) => item.id)
        .sort()
        .join(',')
      const propsIds = filteredMods
        .map((mod) => mod.id)
        .sort()
        .join(',')

      // IDs changed - reset with new mods
      if (currentIds !== propsIds) {
        return filteredMods
      }

      // IDs same but data might have changed - update while preserving order
      return currentItems.map((item) => {
        const updated = filteredMods.find((m) => m.id === item.id)
        return updated || item
      })
    })
  }, [filteredMods, activeId])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)

      const { active, over } = event
      if (!over || active.id === over.id) {
        return
      }

      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        return
      }

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      if (onReorderMod) {
        onReorderMod(collectionId, active.id as number, newIndex + 1).catch((error: unknown) => {
          console.error('Failed to reorder mod:', error)
          setItems(mods)
        })
      }
    },
    [items, collectionId, onReorderMod, mods]
  )

  const handleDragCancel = useCallback((_event: DragCancelEvent) => {
    setActiveId(null)
  }, [])

  if (filteredMods.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 text-center"
        data-testid="mods-list-empty"
      >
        <IconFolder className="h-12 w-12 text-muted-foreground/30 mb-3" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          {searchQuery ? 'No mods match your search' : 'No mods in this collection'}
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items.map((mod) => mod.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1" data-testid="mods-list">
          {items.map((mod) => (
            <SortableModItem
              key={mod.id}
              mod={mod}
              collectionId={collectionId}
              onRemoveMod={onRemoveMod}
              onModClick={onModClick}
              onDownload={onDownload}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
