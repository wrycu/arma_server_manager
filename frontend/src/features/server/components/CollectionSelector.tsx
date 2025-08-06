import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ServerStatus } from '../types'
import type { Collection } from '@/features/collections/types'

interface CollectionSelectorProps {
  server: ServerStatus
  collections: Collection[]
  selectedStartupCollection: Collection | null
  onStartupCollectionChange: (collection: Collection | null) => void
}

export function CollectionSelector({
  server,
  collections,
  selectedStartupCollection,
  onStartupCollectionChange,
}: CollectionSelectorProps) {
  const isServerOnline = server.status === 'online'
  const hasActiveCollection = isServerOnline && server.activeCollection
  const isDifferentCollectionSelected =
    selectedStartupCollection &&
    server.activeCollection &&
    selectedStartupCollection.id !== server.activeCollection.id

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {hasActiveCollection ? (
          <div className="space-y-3">
            {/* Active Collection Display/Selector */}
            <div className="space-y-2">
              <Select
                value={selectedStartupCollection?.id?.toString() || 'none'}
                onValueChange={(value) => {
                  if (value === 'none') {
                    onStartupCollectionChange(null)
                  } else {
                    const collection = collections.find((c) => c.id.toString() === value)
                    onStartupCollectionChange(collection || null)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {selectedStartupCollection ? (
                      <div className="flex items-center justify-between w-full">
                        <span>{selectedStartupCollection.name}</span>
                        {isDifferentCollectionSelected && (
                          <div className="w-2 h-2 bg-primary rounded-full ml-2" />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span>{server.activeCollection?.name || 'Select collection'}</span>
                        {server.activeCollection && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                            Active
                          </span>
                        )}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">No collection selected</span>
                      <span className="text-xs text-muted-foreground">
                        Use current active collection on startup
                      </span>
                    </div>
                  </SelectItem>
                  {server.activeCollection && (
                    <SelectItem value={server.activeCollection.id.toString()}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {server.activeCollection.name}
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Currently running on server
                        </span>
                      </div>
                    </SelectItem>
                  )}
                  {collections
                    .filter((c) => c.id !== server.activeCollection?.id)
                    .map((collection) => (
                      <SelectItem key={collection.id} value={collection.id.toString()}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {collection.name}
                            {collection.isActive && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                Available
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {collection.mods.length} mods • {collection.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <>
            <Select
              value={selectedStartupCollection?.id?.toString() || 'none'}
              onValueChange={(value) => {
                if (value === 'none') {
                  onStartupCollectionChange(null)
                } else {
                  const collection = collections.find((c) => c.id.toString() === value)
                  onStartupCollectionChange(collection || null)
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a collection for startup" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">No collection</span>
                    <span className="text-xs text-muted-foreground">
                      Start server without any mods
                    </span>
                  </div>
                </SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id.toString()}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {collection.name}
                        {collection.isActive && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {collection.mods.length} mods • {collection.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStartupCollection && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{selectedStartupCollection.mods.length} mods will be loaded on startup</p>
                <p className="text-xs">
                  {selectedStartupCollection.mods.filter((m) => !m.disabled).length} enabled,
                  {selectedStartupCollection.mods.filter((m) => m.disabled).length} disabled
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
