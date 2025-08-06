import { useState } from "react"
import { IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/common/PageTitle"
import { UpdatingModCard } from "@/features/mods/components/UpdatingModCard"

import { useCollections } from "./hooks/useCollections"
import { CreateCollectionDialog } from "./components/CreateCollectionDialog"
import { RemoveModDialog } from "./components/RemoveModDialog"
import { ModsList } from "./components/ModsList"
import { CollectionsList } from "./components/CollectionsList"
import type { ModToRemove } from "./types"
import type { Collection } from "./types"

export function CollectionManager() {
  const {
    collections,
    selectedCollection,
    updatingMods,
    setSelectedCollectionId,
    createCollection,
    deleteCollection,
    toggleMod,
    removeModFromCollection,
    updateMod,
    updateAllMods,
    setActive,
    cancelUpdate,
    dismissUpdate,
  } = useCollections()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [modToRemove, setModToRemove] = useState<ModToRemove | null>(null)

  const handleCreateCollection = (newCollection: {
    name: string
    description: string
  }) => {
    createCollection(newCollection)
  }

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollectionId(collection.id)
  }

  const handleRemoveModFromCollection = (
    collectionId: number,
    modId: number,
    modName: string,
  ) => {
    setModToRemove({ collectionId, modId, modName })
    setIsRemoveDialogOpen(true)
  }

  const confirmRemoveMod = () => {
    if (!modToRemove) return

    removeModFromCollection(modToRemove.collectionId, modToRemove.modId)
    setModToRemove(null)
    setIsRemoveDialogOpen(false)
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
                label: "Collections",
                onClick: () => setSelectedCollectionId(null),
              },
            ]}
            actions={
              <>
                {selectedCollection.mods.some(mod => mod.hasUpdate) && (
                  <Button
                    size="sm"
                    onClick={updateAllMods}
                    className="h-7 px-3 text-xs"
                  >
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
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
                  <IconPlus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </>
            }
          />
        </div>

        <div className="flex-1 overflow-auto py-3">
          <ModsList
            mods={selectedCollection.mods}
            collectionId={selectedCollection.id}
            onToggleMod={toggleMod}
            onUpdateMod={updateMod}
            onRemoveMod={handleRemoveModFromCollection}
          />
        </div>

        {updatingMods.length > 0 && (
          <div className="fixed bottom-4 right-4 space-y-2 z-50">
            {updatingMods.map(mod => (
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
