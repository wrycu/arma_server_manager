import { IconFolder, IconPlus, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ModSubscription } from '@/types/mods'

interface ModsListProps {
  mods: ModSubscription[]
  collectionId: number
  onRemoveMod: (collectionId: number, modId: number, modName: string) => void
  onAddMods: (collectionId: number) => void
  onModClick?: (mod: ModSubscription) => void
}

export function ModsList({
  mods,
  collectionId,
  onRemoveMod,
  onAddMods,
  onModClick,
}: ModsListProps) {
  if (mods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <IconFolder className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground mb-3">No mods in this collection</p>
        <Button size="sm" onClick={() => onAddMods(collectionId)}>
          <IconPlus className="h-3 w-3 mr-1" />
          Add Mods
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {mods.map((mod) => (
        <div
          key={mod.id}
          className="group flex items-center gap-3 px-3 py-2 rounded-md border bg-card hover:bg-muted/30 transition-colors"
        >
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
      ))}
    </div>
  )
}
