import { IconFolder, IconPlus, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { ModItem } from '@/types/collections'

interface ModsListProps {
  mods: ModItem[]
  collectionId: number
  onToggleMod: (collectionId: number, modId: number) => void
  onUpdateMod: (mod: ModItem) => void
  onRemoveMod: (collectionId: number, modId: number, modName: string) => void
}

export function ModsList({
  mods,
  collectionId,
  onToggleMod,
  onUpdateMod,
  onRemoveMod,
}: ModsListProps) {
  if (mods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <IconFolder className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground mb-3">No mods in this collection</p>
        <Button size="sm">
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
          className={`group flex items-center gap-3 px-3 py-2 rounded-md border bg-card hover:bg-muted/30 transition-colors ${
            mod.disabled ? 'opacity-50' : ''
          }`}
        >
          <Checkbox
            checked={!mod.disabled}
            onCheckedChange={() => onToggleMod(collectionId, mod.id)}
            className="h-4 w-4"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium truncate ${
                  mod.disabled ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {mod.name}
              </span>
              <div className="flex items-center gap-1">
                {mod.hasUpdate && <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
                {mod.isServerMod && (
                  <Badge variant="outline" className="h-4 px-1 text-xs">
                    S
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>v{mod.version}</span>
              <span>•</span>
              <span>{mod.size}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {mod.hasUpdate && (
              <Button size="sm" onClick={() => onUpdateMod(mod)} className="h-6 px-2 text-xs">
                Update
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveMod(collectionId, mod.id, mod.name)}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
            >
              <IconTrash className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
