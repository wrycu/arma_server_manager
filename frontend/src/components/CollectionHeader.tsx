import { IconArrowLeft, IconFolder, IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Collection } from '@/types/collections'

interface CollectionHeaderProps {
  collection: Collection
  onBack: () => void
  onTitleEdit: (title: string) => void
  onUpdateAll: () => void
  onSetActive: () => void
  isEditingTitle: boolean
  editingTitle: string
  onEditingTitleChange: (title: string) => void
  onStartEditingTitle: () => void
  onSaveTitle: () => void
  onTitleKeyDown: (e: React.KeyboardEvent) => void
}

export function CollectionHeader({
  collection,
  onBack,
  onUpdateAll,
  onSetActive,
  isEditingTitle,
  editingTitle,
  onEditingTitleChange,
  onStartEditingTitle,
  onSaveTitle,
  onTitleKeyDown,
}: CollectionHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b bg-background/95 backdrop-blur">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 w-7 p-0">
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <IconFolder className="h-4 w-4 text-muted-foreground" />
          {isEditingTitle ? (
            <Input
              value={editingTitle}
              onChange={(e) => onEditingTitleChange(e.target.value)}
              onBlur={onSaveTitle}
              onKeyDown={onTitleKeyDown}
              className="h-6 px-2 py-0 font-medium text-sm border-none shadow-none focus-visible:ring-1 focus-visible:ring-ring bg-transparent"
              style={{ width: `${Math.max(editingTitle.length * 8 + 20, 120)}px` }}
              autoFocus
            />
          ) : (
            <span
              className="font-medium cursor-pointer hover:text-foreground/80 transition-colors px-2 py-1 rounded-sm hover:bg-muted/50"
              onClick={onStartEditingTitle}
              title="Click to edit collection name"
            >
              {collection.name}
            </span>
          )}
          {collection.isActive && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-xs bg-green-500/10 text-green-600 border-green-500/20"
            >
              Active
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="h-6 px-2 text-xs">
            {collection.mods.length} mods
          </Badge>
          {collection.mods.some((m) => m.shouldUpdate) && (
            <Badge className="h-6 px-2 text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
              {collection.mods.filter((m) => m.shouldUpdate).length} updates
            </Badge>
          )}
        </div>
        {collection.mods.some((mod) => mod.shouldUpdate) && (
          <Button size="sm" onClick={onUpdateAll} className="h-7 px-3 text-xs">
            Update All
          </Button>
        )}
        {!collection.isActive && (
          <Button variant="outline" size="sm" onClick={onSetActive} className="h-7 px-3 text-xs">
            Set Active
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
          <IconPlus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>
    </div>
  )
}
