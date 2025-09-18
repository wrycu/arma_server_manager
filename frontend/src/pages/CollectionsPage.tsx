import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/PageTitle'
import { UpdatingModCard } from '@/components/UpdatingModCard'

import { useCollections } from '@/hooks/useCollections'
import { CreateCollectionDialog } from '@/components/CollectionsCreateDialog'
import { RemoveModDialog } from '@/components/CollectionsRemoveModDialog'
import { AddModsDialog } from '@/components/AddModsDialog'
import { ModsList } from '@/components/CollectionsModsList'
import { CollectionsList } from '@/components/CollectionsList'
import type { ModToRemove } from '@/types/collections'
import type { Collection } from '@/types/collections'

export function CollectionManager() {
  const {
    collections,
    selectedCollection,
    updatingMods,
    setSelectedCollectionId,
    createCollection,
    deleteCollection,
    removeModFromCollection,
    addModsToCollection,
    updateAllMods,
    setActive,
    cancelUpdate,
    dismissUpdate,
  } = useCollections()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [isAddModsDialogOpen, setIsAddModsDialogOpen] = useState(false)
  const [modToRemove, setModToRemove] = useState<ModToRemove | null>(null)

  const handleCreateCollection = (newCollection: { name: string; description: string }) => {
    createCollection(newCollection)
  }

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollectionId(collection.id)
  }

  const handleRemoveModFromCollection = (collectionId: number, modId: number, modName: string) => {
    setModToRemove({ collectionId, modId, modName })
    setIsRemoveDialogOpen(true)
  }

  const confirmRemoveMod = () => {
    if (!modToRemove) return

    removeModFromCollection(modToRemove.collectionId, modToRemove.modId)
    setModToRemove(null)
    setIsRemoveDialogOpen(false)
  }

  const handleAddMods = (_collectionId: number) => {
    setIsAddModsDialogOpen(true)
  }

  const handleAddModsToCollection = (modIds: number[]) => {
    if (!selectedCollection) return
    addModsToCollection(selectedCollection.id, modIds)
  }

  if (selectedCollection) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="bg-background/95 backdrop-blur">
          <PageTitle
            title={selectedCollection.name}
            description={`${selectedCollection.mods.length} mods in this collection`}
            breadcrumbs={[
              {
                label: 'Collections',
                onClick: () => setSelectedCollectionId(null),
              },
            ]}
            actions={
              <>
                {selectedCollection.mods.some((mod) => mod.shouldUpdate) && (
                  <Button size="sm" onClick={updateAllMods} className="h-7 px-3 text-xs">
                    Update All
                  </Button>
                )}
                {!selectedCollection.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActive(selectedCollection.id)}
                    className="h-7 px-3 text-xs"
                  >
                    Set Active
                  </Button>
                )}
                {selectedCollection.mods.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => handleAddMods(selectedCollection.id)}
                  >
                    <IconPlus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </>
            }
          />
        </div>

        <div className="flex-1 overflow-auto py-3">
          <ModsList
            mods={selectedCollection.mods}
            collectionId={selectedCollection.id}
            onRemoveMod={handleRemoveModFromCollection}
            onAddMods={handleAddMods}
          />
        </div>

        {updatingMods.length > 0 && (
          <div className="fixed bottom-4 right-4 space-y-2 z-50">
            {updatingMods.map((mod) => (
              <UpdatingModCard
                key={mod.id}
                mod={mod}
                onCancel={cancelUpdate}
                onDismiss={dismissUpdate}
              />
            ))}
          </div>
        )}

        <RemoveModDialog
          open={isRemoveDialogOpen}
          onOpenChange={setIsRemoveDialogOpen}
          modToRemove={modToRemove}
          onConfirm={confirmRemoveMod}
        />

        <AddModsDialog
          open={isAddModsDialogOpen}
          onOpenChange={setIsAddModsDialogOpen}
          onAddMods={handleAddModsToCollection}
          existingModIds={selectedCollection.mods.map((mod) => mod.id)}
          collectionName={selectedCollection.name}
        />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="bg-background/95 backdrop-blur">
        <PageTitle
          title="Collections"
          description="Manage your mod collections"
          actions={
            <CreateCollectionDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onCreate={handleCreateCollection}
              trigger={
                <Button size="sm" className="h-7 px-3 text-xs">
                  <IconPlus className="h-3 w-3 mr-1" />
                  New
                </Button>
              }
            />
          }
        />
      </div>

      <div className="flex-1 overflow-auto py-6">
        <CollectionsList
          collections={collections}
          onSelectCollection={handleSelectCollection}
          onDeleteCollection={deleteCollection}
        />
      </div>

      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateCollection}
      />
    </div>
  )
}
