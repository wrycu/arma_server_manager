import { useState } from 'react'
import { useParams, useNavigate, useSearch } from '@tanstack/react-router'
import { IconPlus, IconCheck, IconX } from '@tabler/icons-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageTitle } from '@/components/PageTitle'

import { useCollections } from '@/hooks/useCollections'
import { useServer } from '@/hooks/useServer'
import { useMods } from '@/hooks/useMods'
import { useTitleEditing } from '@/hooks/useTitleEditing'
import { serverService } from '@/services/server.service'
import { RemoveModDialog } from '@/components/CollectionsRemoveModDialog'
import { AddModsDialog } from '@/components/AddModsDialog'
import { ModsList } from '@/components/CollectionsModsList'
import { ModDetailSidebar } from '@/components/ModDetailSidebar'
import type { ModToRemove } from '@/types/collections'
import type { ModSubscription } from '@/types/mods'

export function CollectionDetailPage() {
  const { collectionId } = useParams({ from: '/collections/$collectionId' })
  const search = useSearch({ from: '/collections/$collectionId' }) as { search?: string }
  const navigate = useNavigate()
  const collectionIdNum = parseInt(collectionId, 10)

  const {
    collections,
    removeModFromCollection,
    addModsToCollection,
    reorderModInCollection,
    updateCollectionName,
  } = useCollections()

  const { servers, refetchServers } = useServer()
  const server = servers?.[0] || null

  const { updateModSubscription, uninstallMod, downloadMod, downloadingModId, uninstallingModId } =
    useMods()

  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [isAddModsDialogOpen, setIsAddModsDialogOpen] = useState(false)
  const [modToRemove, setModToRemove] = useState<ModToRemove | null>(null)
  const [selectedModId, setSelectedModId] = useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(search?.search || '')

  // Title editing state
  const {
    isEditingTitle,
    editingTitle,
    setEditingTitle,
    startEditingTitle,
    saveTitle,
    cancelEditingTitle,
    handleTitleKeyDown,
  } = useTitleEditing()

  // Find the collection by ID
  const collection = collections.find((c) => c.id === collectionIdNum)

  // Derive selectedMod from current collection data to ensure it's always up-to-date
  const selectedMod =
    selectedModId && collection ? collection.mods.find((m) => m.id === selectedModId) || null : null

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
    if (!collection) return
    addModsToCollection(collection.id, modIds)
  }

  const handleSetActiveCollection = async () => {
    if (!server || !collection) {
      toast.error('No server configuration found')
      return
    }

    try {
      await serverService.updateServerCollectionId(server.id, collection.id)
      toast.success(`Set "${collection.name}" as active collection`)
      // Refetch server data to get updated collection_id
      refetchServers()
    } catch (error) {
      console.error('Failed to set active collection:', error)
      toast.error(
        `Failed to set active collection: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  const handleBackToCollections = () => {
    navigate({ to: '/collections' })
  }

  const handleModClick = (mod: ModSubscription) => {
    setSelectedModId(mod.id)
    setIsSidebarOpen(true)
  }

  const handleRemoveFromSidebar = () => {
    if (selectedMod) {
      handleRemoveModFromCollection(collectionIdNum, selectedMod.id, selectedMod.name)
      setIsSidebarOpen(false)
    }
  }

  const handleSaveModSettings = async (steamId: number, updates: { isServerMod: boolean }) => {
    await updateModSubscription(steamId, {
      isServerMod: updates.isServerMod,
    })
    toast.success('Mod settings updated successfully')
  }

  const handleUninstall = async (steamId: number) => {
    await uninstallMod(steamId)
  }

  const handleDownload = async (steamId: number) => {
    await downloadMod(steamId)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    navigate({
      to: '/collections/$collectionId',
      params: { collectionId },
      search: value ? { search: value } : {},
    })
  }

  const handleSaveCollectionName = async (newName: string) => {
    if (!collection) return
    // Only save if the name has actually changed
    if (newName.trim() === collection.name) {
      cancelEditingTitle()
      return
    }
    try {
      await updateCollectionName(collection.id, newName)
    } catch (error) {
      console.error('Failed to update collection name:', error)
      toast.error('Failed to update collection name')
    }
  }

  if (!collection) {
    return (
      <div className="space-y-4">
        <PageTitle
          title="Collection Not Found"
          description="The requested collection could not be found"
          breadcrumbs={[
            {
              label: 'Collections',
              onClick: handleBackToCollections,
            },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Collection not found</p>
            <Button onClick={handleBackToCollections} variant="outline">
              Back to Collections
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden -ml-8">
      <div className="flex-shrink-0 space-y-4 pb-4 pl-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-foreground">
                <button
                  onClick={handleBackToCollections}
                  className="font-medium transition-all duration-200 text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-muted/50"
                >
                  Collections
                </button>
                <span className="text-muted-foreground/60 mx-2">/</span>
                {isEditingTitle ? (
                  <span className="inline-flex items-center gap-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => handleTitleKeyDown(e, handleSaveCollectionName)}
                      className="h-8 text-lg font-semibold inline-block w-auto min-w-[200px]"
                      autoFocus
                      onBlur={() => saveTitle(handleSaveCollectionName)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => saveTitle(handleSaveCollectionName)}
                      disabled={editingTitle.trim() === collection.name}
                    >
                      <IconCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={cancelEditingTitle}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </span>
                ) : (
                  <button
                    onClick={() => startEditingTitle(collection.name)}
                    className="hover:text-muted-foreground transition-colors cursor-pointer"
                  >
                    {collection.name}
                  </button>
                )}
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {collection.mods.length} mods in this collection
            </p>
          </div>
          <div className="flex items-center gap-2">
            {server && server.collection_id !== collection.id && (
              <Button variant="outline" size="xs" onClick={handleSetActiveCollection}>
                Set Active
              </Button>
            )}
            {server && server.collection_id === collection.id && (
              <Button variant="outline" size="xs" disabled>
                Active
              </Button>
            )}
            {collection.mods.length > 0 && (
              <Button variant="outline" size="xs" onClick={() => handleAddMods(collection.id)}>
                <IconPlus className="h-4 w-4" />
                Add Mods
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <Input
            placeholder="Filter mods..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full max-w-3xl rounded-md">
          <ModsList
            mods={collection.mods}
            collectionId={collection.id}
            searchQuery={searchQuery}
            onRemoveMod={handleRemoveModFromCollection}
            onAddMods={handleAddMods}
            onModClick={handleModClick}
            onReorderMod={reorderModInCollection}
            onDownload={handleDownload}
          />
        </ScrollArea>
      </div>

      <ModDetailSidebar
        mod={selectedMod}
        open={isSidebarOpen}
        onOpenChange={(open) => {
          setIsSidebarOpen(open)
          if (!open) {
            setSelectedModId(null)
          }
        }}
        onRemove={handleRemoveFromSidebar}
        onSave={handleSaveModSettings}
        onDownload={handleDownload}
        onUninstall={handleUninstall}
        isDownloading={selectedMod ? downloadingModId === selectedMod.id : false}
        isUninstalling={selectedMod ? uninstallingModId === selectedMod.id : false}
      />

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
        existingModIds={collection.mods.map((mod) => mod.id)}
        collectionName={collection.name}
      />
    </div>
  )
}
