import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'

import { PageTitle } from '@/components/PageTitle'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Collections imports
import { useCollections } from '@/hooks/useCollections'
import { useServer } from '@/hooks/useServer'
import { serverService } from '@/services/server.service'
import { CollectionsDataTable } from '@/components/CollectionsDataTable'
import { CollectionDetailSidebar } from '@/components/CollectionDetailSidebar'
import { getColumns as getCollectionsColumns } from '@/components/CollectionsColumns'
import type { Collection } from '@/types/collections'

// Subscriptions imports
import { useMods } from '@/hooks/useMods'
import { DataTable } from '@/components/ModsDataTable'
import { getColumns as getModsColumns } from '@/components/ModsColumns'
import { ModsSubscribeDialog } from '@/components/ModsSubscribeDialog'
import { ModDetailSidebar } from '@/components/ModDetailSidebar'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import type { ExtendedModSubscription } from '@/types/mods'
import type { CreateCollectionRequest } from '@/types/api'

export function ModsPage() {
  const search = useSearch({ from: '/arma3/mods/' }) as { tab?: string; modId?: number }
  const [activeTab, setActiveTab] = useState(search.tab || 'collections')

  // Update active tab when search params change
  useEffect(() => {
    if (search.tab) {
      setActiveTab(search.tab)
    }
  }, [search.tab])

  return (
    <div className="space-y-6">
      <PageTitle title="Mods" description="Manage your mod collections and subscriptions" />

      <div className="space-y-4">
        {activeTab === 'collections' ? (
          <CollectionsTabContent activeTab={activeTab} onTabChange={setActiveTab} />
        ) : (
          <SubscriptionsTabContent activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </div>
    </div>
  )
}

// Collections Tab Component
function CollectionsTabContent({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const navigate = useNavigate()
  const { collections, createCollection, deleteCollection, updateCollection, isCreating } =
    useCollections()

  const { servers, refetchServers } = useServer()
  const server = servers?.[0] || null

  const [selectedCollection, _setSelectedCollection] = useState<Collection | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleCreateCollection = async (newCollection: { name: string; description: string }) => {
    await createCollection(newCollection)
  }

  const handleRowClick = (collection: Collection) => {
    // Navigate to collection detail page
    navigate({ to: `/arma3/mods/${collection.id}` })
  }

  const handleSetActiveCollection = async (collection: Collection) => {
    if (!server) {
      toast.error('No server configuration found')
      return
    }

    try {
      await serverService.updateServerCollectionId(server.id, collection.id)
      toast.success(`Set "${collection.name}" as active collection`)
      // Refetch server data to get updated collection_id
      refetchServers()
      setIsSidebarOpen(false)
    } catch (error) {
      console.error('Failed to set active collection:', error)
      toast.error(
        `Failed to set active collection: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  const handleSave = async (id: number, updates: { name: string; description: string }) => {
    await updateCollection(id, updates)
    toast.success('Collection updated successfully')
  }

  const handleDelete = async (id: number) => {
    await deleteCollection(id)
    setIsSidebarOpen(false)
    toast.success('Collection deleted successfully')
  }

  // Memoize columns to prevent recreation on every render
  const columns = useMemo(
    () => getCollectionsColumns(server?.collection_id),
    [server?.collection_id]
  )

  return (
    <>
      <CollectionsDataTable
        columns={columns}
        data={collections}
        onRowClick={handleRowClick}
        onCreateCollection={handleCreateCollection}
        isCreating={isCreating}
        tabSwitcher={
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
            <TabsList>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <CollectionDetailSidebar
        collection={selectedCollection}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        onSave={handleSave}
        onSetActive={handleSetActiveCollection}
        onDelete={handleDelete}
        isActive={server?.collection_id === selectedCollection?.id}
      />
    </>
  )
}

// Subscriptions Tab Component
function SubscriptionsTabContent({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const search = useSearch({ from: '/arma3/mods/' }) as { tab?: string; modId?: number }
  const navigate = useNavigate()

  const {
    modSubscriptions,
    addModSubscription,
    removeModSubscription,
    updateModSubscription,
    downloadMod,
    uninstallMod,
    downloadingModId,
    uninstallingModId,
  } = useMods()

  // Transform mod subscriptions to match UI expectations
  const mods: ExtendedModSubscription[] = modSubscriptions.map((mod) => ({
    ...mod,
    author: 'Community', // Default fallback
    type: mod.modType || 'mod', // Default fallback
    sizeOnDisk: `Unknown`,
  }))

  const handleDelete = async (steamId: number) => {
    await removeModSubscription(steamId)
  }

  const handleBatchDelete = (steamIds: number[]) => {
    if (steamIds.length === 0) return
    setModsToDelete(steamIds)
    setDeleteConfirmOpen(true)
  }

  const confirmBatchDelete = async () => {
    try {
      // Delete all selected mods using their Steam IDs
      for (const steamId of modsToDelete) {
        await removeModSubscription(steamId)
      }
      toast.success(`Successfully deleted ${modsToDelete.length} mod(s)`)
    } catch (error) {
      console.error('Failed to delete mods:', error)
      toast.error('Failed to delete some mods')
    } finally {
      setModsToDelete([])
    }
  }

  const handleDownload = async (steamId: number) => {
    await downloadMod(steamId)
  }

  const handleUninstall = async (steamId: number) => {
    await uninstallMod(steamId)
  }

  const handleCreateCollection = (collection: CreateCollectionRequest) => {
    // TODO: Integrate with collections API
    console.log('Creating collection:', collection)
    // For now, just log the collection data
    // This will be implemented when the collections API is available
  }

  // Sidebar state and handlers
  const [selectedModId, setSelectedModId] = useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Batch delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [modsToDelete, setModsToDelete] = useState<number[]>([]) // Steam IDs

  // Get the current mod data for the sidebar
  const selectedMod = selectedModId ? mods.find((mod) => mod.id === selectedModId) || null : null

  // Auto-open sidebar when modId is in URL search params
  useEffect(() => {
    if (search.modId && mods.length > 0) {
      const mod = mods.find((m) => m.id === search.modId)
      if (mod) {
        setSelectedModId(mod.id)
        setIsSidebarOpen(true)
        // Clear the modId from URL after opening
        navigate({
          to: '/arma3/mods',
          search: { tab: 'subscriptions' },
          replace: true,
        })
      }
    }
  }, [search.modId, mods, navigate])

  const handleRowClick = (mod: ExtendedModSubscription) => {
    setSelectedModId(mod.id)
    setIsSidebarOpen(true)
  }

  const handleSave = async (steamId: number, updates: { isServerMod: boolean }) => {
    await updateModSubscription(steamId, updates)
    toast.success('Mod settings updated successfully')
  }

  // Memoize columns to prevent recreation on every render
  const columns = useMemo(() => getModsColumns(), [])

  // Subscribe dialog state and handler
  const [subscribeOpen, setSubscribeOpen] = useState(false)
  const handleSubscribeMods = async (steamIds: number[], downloadNow: boolean) => {
    for (const id of steamIds) {
      await addModSubscription(id)
    }

    if (downloadNow) {
      for (const id of steamIds) {
        await downloadMod(id)
      }
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={mods}
        onCreateCollection={handleCreateCollection}
        onBatchDelete={handleBatchDelete}
        onRowClick={handleRowClick}
        onSubscribeClick={() => setSubscribeOpen(true)}
        tabSwitcher={
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
            <TabsList>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <ModsSubscribeDialog
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
        onSubscribe={handleSubscribeMods}
      />

      <ModDetailSidebar
        mod={selectedMod}
        open={isSidebarOpen}
        onOpenChange={(open) => {
          setIsSidebarOpen(open)
          if (!open) {
            setSelectedModId(null)
          }
        }}
        onSave={handleSave}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onUninstall={handleUninstall}
        isDownloading={selectedMod ? downloadingModId === selectedMod.id : false}
        isUninstalling={selectedMod ? uninstallingModId === selectedMod.id : false}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Mods"
        description={`Are you sure you want to delete ${modsToDelete.length} mod(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmBatchDelete}
      />
    </>
  )
}

// Export legacy names for backwards compatibility
export const SubscribedModsManager = ModsPage
export const CollectionsListPage = ModsPage
