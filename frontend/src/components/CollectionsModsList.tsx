import { useState, useEffect, useCallback } from 'react'
import { IconFolder, IconPlus, IconGripVertical } from '@tabler/icons-react'
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription } from '@/components/ui/item'
import type { ModSubscription } from '@/types/mods'
import { modService } from '@/services/mods.service'

interface ModsListProps {
  mods: ModSubscription[]
  collectionId: number
  searchQuery?: string
  onRemoveMod: (collectionId: number, modId: number, modName: string) => void
  onAddMods: (collectionId: number) => void
  onModClick?: (mod: ModSubscription) => void
  onReorderMod?: (collectionId: number, modId: number, newPosition: number) => Promise<void>
}

interface SortableModItemProps {
  mod: ModSubscription
  collectionId: number
  onRemoveMod: (collectionId: number, modId: number, modName: string) => void
  onModClick?: (mod: ModSubscription) => void
  imageUrl: string | null
}

function SortableModItem({
  mod,
  collectionId,
  onRemoveMod,
  onModClick,
  imageUrl,
}: SortableModItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: mod.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="group/sortable flex items-start">
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover/sortable:opacity-100 cursor-grab active:cursor-grabbing transition-opacity duration-150 flex items-center justify-center w-8 h-6 shrink-0 mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <IconGripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Item
            variant="muted"
            size="sm"
            className="cursor-pointer w-full max-w-3xl py-2 bg-muted border border-border"
            onClick={() => onModClick?.(mod)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onModClick?.(mod)
              }
            }}
            tabIndex={0}
          >
            <ItemMedia>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={imageUrl || undefined}
                  alt={mod.name}
                  className="object-cover antialiased"
                  style={{ imageRendering: 'auto' }}
                />
                <AvatarFallback className="text-xs">
                  {mod.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>

            <ItemContent>
              <ItemTitle>
                {mod.name}
                {mod.isServerMod && (
                  <Badge variant="outline" className="h-4 px-1 text-xs">
                    S
                  </Badge>
                )}
              </ItemTitle>
              <ItemDescription>{mod.size}</ItemDescription>
            </ItemContent>
          </Item>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => onRemoveMod(collectionId, mod.id, mod.name)}
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
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
  const [imageCache, setImageCache] = useState<Map<number, string>>(new Map())

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

  // Only sync from props when the set of mod IDs changes (additions/removals), not just reordering
  useEffect(() => {
    const currentIds = items
      .map((item) => item.id)
      .sort()
      .join(',')
    const propsIds = filteredMods
      .map((mod) => mod.id)
      .sort()
      .join(',')

    // Only update if the set of mods has changed (not just reordered)
    if (currentIds !== propsIds && !activeId) {
      setItems(filteredMods)
    }
  }, [filteredMods, activeId, items])

  // Load and cache mod images
  useEffect(() => {
    const loadImages = async () => {
      const newCache = new Map(imageCache)
      const modsToLoad = mods.filter((mod) => !imageCache.has(mod.id))

      for (const mod of modsToLoad) {
        try {
          const blob = await modService.getModSubscriptionImage(mod.id)
          const objectUrl = URL.createObjectURL(blob)
          newCache.set(mod.id, objectUrl)
        } catch (error) {
          console.error('Failed to load mod image:', error)
        }
      }

      if (modsToLoad.length > 0) {
        setImageCache(newCache)
      }
    }

    loadImages()

    // Cleanup: revoke URLs for mods that are no longer in the list
    return () => {
      const currentModIds = new Set(mods.map((mod) => mod.id))
      imageCache.forEach((url, modId) => {
        if (!currentModIds.has(modId)) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [mods, imageCache])

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

      if (onReorderMod) {
        onReorderMod(collectionId, active.id as number, newIndex + 1).catch((error: unknown) => {
          console.error('Failed to reorder mod:', error)
          setItems(filteredMods)
        })
      }
    },
    [items, collectionId, onReorderMod, filteredMods]
  )

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveId(null)
  }

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
              imageUrl={imageCache.get(mod.id) || null}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
