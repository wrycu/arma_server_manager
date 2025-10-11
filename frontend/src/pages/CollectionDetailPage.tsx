import { useState } from 'react'
import { useParams, useNavigate, useSearch } from '@tanstack/react-router'
import { IconPlus } from '@tabler/icons-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageTitle } from '@/components/PageTitle'

import { useCollections } from '@/hooks/useCollections'
import { useServer } from '@/hooks/useServer'
import { useMods } from '@/hooks/useMods'
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

  const { collections, removeModFromCollection, addModsToCollection, reorderModInCollection } =
    useCollections()

  const { servers, refetchServers } = useServer()
  const server = servers?.[0] || null

  const { updateModSubscription, uninstallMod } = useMods()

  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [isAddModsDialogOpen, setIsAddModsDialogOpen] = useState(false)
  const [modToRemove, setModToRemove] = useState<ModToRemove | null>(null)
  const [selectedMod, setSelectedMod] = useState<ModSubscription | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(search?.search || '')

  // Find the collection by ID
  const collection = collections.find((c) => c.id === collectionIdNum)

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
    setSelectedMod(mod)
    setIsSidebarOpen(true)
  }

  const handleRemoveFromSidebar = () => {
    if (selectedMod) {
      handleRemoveModFromCollection(collectionIdNum, selectedMod.id, selectedMod.name)
      setIsSidebarOpen(false)
    }
  }

  const handleSaveModSettings = async (
    steamId: number,
    updates: { arguments: string | null; isServerMod: boolean }
  ) => {
    await updateModSubscription(steamId, {
      arguments: updates.arguments,
      isServerMod: updates.isServerMod,
    })
    toast.success('Mod settings updated successfully')
  }

  const handleUninstall = async (steamId: number) => {
    await uninstallMod(steamId)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    navigate({
      to: '/collections/$collectionId',
      params: { collectionId },
      search: value ? { search: value } : {},
    })
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
          <PageTitle
            title={collection.name}
            description={`${collection.mods.length} mods in this collection`}
            breadcrumbs={[
              {
                label: 'Collections',
                onClick: handleBackToCollections,
              },
            ]}
          />
          <div className="flex items-center gap-2">
            {server && server.collection_id !== collection.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetActiveCollection}
                className="h-7 px-3 text-xs"
              >
                Set Active
              </Button>
            )}
            {server && server.collection_id === collection.id && (
              <Button variant="outline" size="sm" disabled className="h-7 px-3 text-xs">
                Active
              </Button>
            )}
            {collection.mods.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => handleAddMods(collection.id)}
              >
                <IconPlus className="h-3 w-3 mr-1" />
                New
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
          />
        </ScrollArea>
      </div>

      <ModDetailSidebar
        mod={selectedMod}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        onRemove={handleRemoveFromSidebar}
        onSave={handleSaveModSettings}
        onUninstall={handleUninstall}
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
