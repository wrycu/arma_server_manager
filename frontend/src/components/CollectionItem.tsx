import { IconFolder, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Collection } from '@/types/collections'

interface CollectionItemProps {
  collection: Collection
  onSelectCollection: (collection: Collection) => void
  onDeleteCollection: (collectionId: number) => void
}

export function CollectionItem({
  collection,
  onSelectCollection,
  onDeleteCollection,
}: CollectionItemProps) {
  return (
    <div className="group flex items-center gap-3 px-3 py-3 rounded-md border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2 flex-shrink-0">
        <IconFolder className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectCollection(collection)}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm truncate">{collection.name}</span>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="h-4 px-1 text-xs">
              {collection.mods.length} mods
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground truncate">{collection.description}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDeleteCollection(collection.id)
          }}
        >
          <IconTrash className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
