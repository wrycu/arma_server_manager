import { useState, useEffect, useRef, useCallback } from 'react'
import { IconFolder, IconPlus, IconTrash, IconGripVertical } from '@tabler/icons-react'
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
import { Badge } from '@/components/ui/badge'
import type { ModSubscription } from '@/types/mods'

interface ModsListProps {
  mods: ModSubscription[]
  collectionId: number
  searchQuery?: string
  onRemoveMod: (collectionId: number, modId: number, modName: string) => void
  onAddMods: (collectionId: number) => void
  onModClick?: (mod: ModSubscription) => void
  onReorderMod?: (collectionId: number, modId: number, newPosition: number) => void
}

interface SortableModItemProps {
  mod: ModSubscription
  collectionId: number
  onRemoveMod: (collectionId: number, modId: number, modName: string) => void
  onModClick?: (mod: ModSubscription) => void
}

function SortableModItem({ mod, collectionId, onRemoveMod, onModClick }: SortableModItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: mod.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 px-3 py-2 rounded-md border bg-card hover:bg-muted/30 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <IconGripVertical className="h-4 w-4" />
      </div>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onModClick?.(mod)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onModClick?.(mod)
          }
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{mod.name}</span>
          <div className="flex items-center gap-1">
            {mod.isServerMod && (
              <Badge variant="outline" className="h-4 px-1 text-xs">
                S
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{mod.size}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemoveMod(collectionId, mod.id, mod.name)
          }}
          className="h-6 w-6 p-0 hover:text-destructive"
        >
          <IconTrash className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function ModsList({
  mods,
  collectionId,
  searchQuery = '',
  onRemoveMod,
  onAddMods,
  onModClick,
  onReorderMod,
}: ModsListProps) {
  const [items, setItems] = useState(mods)
  const [activeId, setActiveId] = useState<number | null>(null)
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingOperationRef = useRef(false)

  // Filter mods based on search query
  const filteredMods = mods.filter((mod) =>
    mod.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  useEffect(() => {
    if (!activeId && !pendingOperationRef.current) {
      setItems(filteredMods)
    }
  }, [filteredMods, activeId])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

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
      pendingOperationRef.current = true

      if (reorderTimeoutRef.current) {
        clearTimeout(reorderTimeoutRef.current)
      }

      reorderTimeoutRef.current = setTimeout(async () => {
        try {
          if (onReorderMod) {
            await onReorderMod(collectionId, active.id as number, newIndex + 1)
          }
        } catch (error) {
          console.error('Failed to reorder mod:', error)
          setItems(filteredMods)
        } finally {
          pendingOperationRef.current = false
        }
      }, 300)
    },
    [items, collectionId, onReorderMod, filteredMods]
  )

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveId(null)
  }

  useEffect(() => {
    return () => {
      if (reorderTimeoutRef.current) {
        clearTimeout(reorderTimeoutRef.current)
      }
    }
  }, [])

  if (filteredMods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <IconFolder className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground mb-3">
          {searchQuery ? 'No mods match your search' : 'No mods in this collection'}
        </p>
        {!searchQuery && (
          <Button size="sm" onClick={() => onAddMods(collectionId)}>
            <IconPlus className="h-3 w-3 mr-1" />
            Add Mods
          </Button>
        )}
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
        <div className="space-y-1">
          {items.map((mod) => (
            <SortableModItem
              key={mod.id}
              mod={mod}
              collectionId={collectionId}
              onRemoveMod={onRemoveMod}
              onModClick={onModClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
