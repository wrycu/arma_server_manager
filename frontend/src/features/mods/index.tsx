import { PageTitle } from '@/components/common/PageTitle';
import { useMods } from './hooks';
import { UpdatingModCard } from './components/UpdatingModCard';
import { DataTable } from './components/DataTable';
import { getColumns } from './components/columns';
import type { ExtendedModSubscription } from './types';
import type { NewCollection } from '@/features/collections/types';

export function InstalledModsManager() {
  const {
    modSubscriptions,
    updatingMods,
    isLoading,
    downloadMod,
    removeModSubscription,
    cancelUpdate,
    dismissUpdate,
  } = useMods();

  // Transform mod subscriptions to match UI expectations
  const mods: ExtendedModSubscription[] = modSubscriptions.map((mod) => ({
    ...mod,
    author: 'Community', // Default fallback
    type: mod.type || 'mod', // Use type from API or default to 'mod'
    hasUpdate: Math.random() > 0.7, // Mock update status
    sizeOnDisk: `${Math.floor(Math.random() * 500 + 50)} MB`, // Mock size
  }));

  const handleUpdate = async (steamId: number) => {
    await downloadMod(steamId);
  };

  const handleDelete = async (steamId: number) => {
    await removeModSubscription(steamId);
  };

  const handleCreateCollection = (collection: NewCollection) => {
    // TODO: Integrate with collections API
    console.log('Creating collection:', collection);
    // For now, just log the collection data
    // This will be implemented when the collections API is available
  };

  const columns = getColumns({
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onDownload: downloadMod,
    isLoading,
  });

  return (
    <div className="space-y-4">
      <PageTitle title="Installed Mods" description="Manage your installed content" />

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

      <DataTable
        columns={columns}
        data={mods}
        onCreateCollection={handleCreateCollection}
      />
    </div>
  );
}
