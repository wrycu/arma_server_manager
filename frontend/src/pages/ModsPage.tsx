import { PageTitle } from '@/components/PageTitle'
import { useMods } from '@/hooks/useMods'
import { DataTable } from '@/components/ModsDataTable'
import { getColumns } from '@/components/ModsColumns'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { ModsSubscribeDialog } from '@/components/ModsSubscribeDialog'
import { ModDetailSidebar } from '@/components/ModDetailSidebar'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { toast } from 'sonner'
import type { ExtendedModSubscription } from '@/types/mods'
import type { CreateCollectionRequest } from '@/types/api'

export function SubscribedModsManager() {
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

  const handleRowClick = (mod: ExtendedModSubscription) => {
    setSelectedModId(mod.id)
    setIsSidebarOpen(true)
  }

  const handleSave = async (steamId: number, updates: { isServerMod: boolean }) => {
    await updateModSubscription(steamId, updates)
    toast.success('Mod settings updated successfully')
  }

  // Memoize columns to prevent recreation on every render
  const columns = useMemo(() => getColumns(), [])

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Mod Subscriptions" description="Manage your installed content" />
        <Button size="xs" onClick={() => setSubscribeOpen(true)}>
          <IconPlus className="h-4 w-4" />
          New
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={mods}
        onCreateCollection={handleCreateCollection}
        onBatchDelete={handleBatchDelete}
        onRowClick={handleRowClick}
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
    </div>
  )
}
