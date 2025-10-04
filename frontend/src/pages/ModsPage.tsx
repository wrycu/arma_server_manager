import { PageTitle } from '@/components/PageTitle'
import { useMods } from '@/hooks/useMods'
import { DataTable } from '@/components/ModsDataTable'
import { getColumns } from '@/components/ModsColumns'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { ModsSubscribeDialog } from '@/components/ModsSubscribeDialog'
import { ModDetailSidebar } from '@/components/ModDetailSidebar'
import { toast } from 'sonner'
import type { ExtendedModSubscription, ModSubscription } from '@/types/mods'
import type { CreateCollectionRequest } from '@/types/api'

export function SubscribedModsManager() {
  const {
    modSubscriptions,
    addModSubscription,
    removeModSubscription,
    updateModSubscription,
    downloadMod,
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

  const handleDownload = async (steamId: number) => {
    await downloadMod(steamId)
  }

  const handleCreateCollection = (collection: CreateCollectionRequest) => {
    // TODO: Integrate with collections API
    console.log('Creating collection:', collection)
    // For now, just log the collection data
    // This will be implemented when the collections API is available
  }

  // Sidebar state and handlers
  const [selectedMod, setSelectedMod] = useState<ModSubscription | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleRowClick = (mod: ExtendedModSubscription) => {
    setSelectedMod(mod)
    setIsSidebarOpen(true)
  }

  const handleSave = async (
    steamId: number,
    updates: { arguments: string | null; isServerMod: boolean }
  ) => {
    await updateModSubscription(steamId, updates)
    toast.success('Mod settings updated successfully')
  }

  const columns = getColumns()

  // Subscribe dialog state and handler
  const [subscribeOpen, setSubscribeOpen] = useState(false)
  const handleSubscribeMods = async (steamIds: number[]) => {
    for (const id of steamIds) {
      await addModSubscription(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Mod Subscriptions" description="Manage your installed content" />
        <Button size="sm" className="h-7 px-3 text-xs" onClick={() => setSubscribeOpen(true)}>
          <IconPlus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={mods}
        onCreateCollection={handleCreateCollection}
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
        onOpenChange={setIsSidebarOpen}
        onSave={handleSave}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </div>
  )
}
