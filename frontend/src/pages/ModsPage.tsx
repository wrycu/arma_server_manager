import { PageTitle } from '@/components/PageTitle'
import { useMods } from '@/hooks/useMods'
import { DataTable } from '@/components/ModsDataTable'
import { getColumns } from '@/components/ModsColumns'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { ModsSubscribeDialog } from '@/components/ModsSubscribeDialog'
import type { ExtendedModSubscription } from '@/types/mods'
import type { CreateCollectionRequest } from '@/types/api'

export function SubscribedModsManager() {
  const {
    modSubscriptions,
    isLoading,
    addModSubscription,
    removeModSubscription,
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

  const handleCreateCollection = (collection: CreateCollectionRequest) => {
    // TODO: Integrate with collections API
    console.log('Creating collection:', collection)
    // For now, just log the collection data
    // This will be implemented when the collections API is available
  }

  const columns = getColumns({
    onDelete: handleDelete,
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
        <PageTitle title="Mod Subscriptions" description="Manage your installed content" />
        <Button size="sm" className="h-7 px-3 text-xs" onClick={() => setSubscribeOpen(true)}>
          <IconPlus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>


      <DataTable columns={columns} data={mods} onCreateCollection={handleCreateCollection} />

      <ModsSubscribeDialog
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
        onSubscribe={handleSubscribeMods}
      />
    </div>
  )
}
