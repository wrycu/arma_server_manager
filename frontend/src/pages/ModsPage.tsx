import { PageTitle } from '@/components/PageTitle'
import { useMods } from '@/hooks/useMods'
import { UpdatingModCard } from '@/components/UpdatingModCard'
import { DataTable } from '@/components/ModsDataTable'
import { getColumns } from '@/components/ModsColumns'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { ModsSubscribeDialog } from '@/components/ModsSubscribeDialog'
import type { ExtendedModSubscription } from '@/types/mods'
import type { CreateCollectionRequest } from '@/types/api'

export function InstalledModsManager() {
  const {
    modSubscriptions,
    updatingMods,
    isLoading,
    addModSubscription,
    downloadMod,
    removeModSubscription,
    cancelUpdate,
    dismissUpdate,
  } = useMods()

  // Transform mod subscriptions to match UI expectations
  const mods: ExtendedModSubscription[] = modSubscriptions.map((mod) => ({
    ...mod,
    author: 'Community', // Default fallback
    type: mod.modType || 'mod', // Use type from API or default to 'mod'
    hasUpdate: Math.random() > 0.7, // Mock update status
    sizeOnDisk: `${Math.floor(Math.random() * 500 + 50)} MB`, // Mock size
  }))

  const handleUpdate = async (steamId: number) => {
    await downloadMod(steamId)
  }

  const handleDelete = async (steamId: number) => {
    await removeModSubscription(steamId)
  }

  const handleCreateCollection = (collection: CreateCollectionRequest) => {
    // TODO: Integrate with collections API
    console.log('Creating collection:', collection)
    // For now, just log the collection data
    // This will be implemented when the collections API is available
  }

  const columns = getColumns({
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onDownload: downloadMod,
    isLoading,
  })

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
        <PageTitle title="Installed Mods" description="Manage your installed content" />
        <Button size="sm" onClick={() => setSubscribeOpen(true)}>
          <IconPlus className="h-4 w-4 mr-1" />
          Subscribe to Mods
        </Button>
      </div>

      {/* Show updating mods */}
      {updatingMods.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Updating Mods</h3>
          <div className="space-y-2">
            {updatingMods.map((mod) => (
              <UpdatingModCard
                key={mod.id}
                mod={mod}
                onCancel={cancelUpdate}
                onDismiss={dismissUpdate}
              />
            ))}
          </div>
        </div>
      )}

      <DataTable columns={columns} data={mods} onCreateCollection={handleCreateCollection} />

      <ModsSubscribeDialog
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
        onSubscribe={handleSubscribeMods}
      />
    </div>
  )
}
