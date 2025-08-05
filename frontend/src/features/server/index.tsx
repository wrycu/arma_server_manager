import { useState, useEffect } from 'react';
import { useNavigation } from '@/hooks/use-navigation';
import { IconTerminal, IconSettings } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/common/PageTitle';

import { CompactServerStatus } from './components/CompactServerStatus';
import { ServerCharts } from './components/ServerCharts';
import { useCollections } from '@/features/collections/hooks/useCollections';
import { useServer } from './hooks';
import type { Collection } from '@/features/collections/types';

export function ServerControlPanel() {
  const { setCurrentPage } = useNavigation();
  const { collections } = useCollections();
  const { server, metricsHistory, isLoading, performServerAction } = useServer();

  const [selectedStartupCollection, setSelectedStartupCollection] =
    useState<Collection | null>(null);

  // Set the selected collection when collections are loaded and server has an active collection
  useEffect(() => {
    if (collections.length > 0 && server?.activeCollection) {
      const activeCollection = collections.find(
        (c: Collection) => c.id === server.activeCollection?.id
      );
      if (activeCollection && !selectedStartupCollection) {
        setSelectedStartupCollection(activeCollection);
      }
    }
  }, [collections, server?.activeCollection, selectedStartupCollection]);

  const handleServerAction = async (
    action: 'start' | 'stop' | 'restart',
    collectionId?: number
  ) => {
    await performServerAction({
      action,
      collectionId,
    });
  };

  const handleStartupCollectionChange = (collection: Collection | null) => {
    setSelectedStartupCollection(collection);
  };

  // Show loading state if server data is not available yet
  if (!server) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Control Panel"
          description="Manage your ARMA 3 server"
          breadcrumbs={[
            {
              label: 'Server',
              onClick: () => setCurrentPage('server'),
            },
          ]}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading server status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageTitle
        title="Control Panel"
        description="Manage your ARMA 3 server"
        breadcrumbs={[
          {
            label: 'Server',
            onClick: () => setCurrentPage('server'),
          },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => setCurrentPage('server-configs')}>
              <IconSettings className="size-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline">
              <IconTerminal className="size-4 mr-2" />
              Console
            </Button>
          </>
        }
      />

      {/* Main Content Grid: Server Status (1/2) + Charts (1/2) */}
      <div className="grid grid-cols-2 gap-6 items-start">
        {/* Server Management Panel - 1/2 width */}
        <div className="col-span-1 h-full">
          <CompactServerStatus
            server={server}
            isLoading={isLoading}
            collections={collections}
            selectedStartupCollection={selectedStartupCollection}
            onServerAction={handleServerAction}
            onStartupCollectionChange={handleStartupCollectionChange}
          />
        </div>

        {/* Charts Section - 1/2 width */}
        <div className="col-span-1 h-full">
          <ServerCharts
            playerHistory={metricsHistory}
            resourceHistory={metricsHistory}
          />
        </div>
      </div>
    </div>
  );
}
