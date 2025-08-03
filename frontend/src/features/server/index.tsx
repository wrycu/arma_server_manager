import { useState, useEffect } from 'react';
import { useNavigation } from '@/hooks/use-navigation';
import { IconTerminal, IconSettings } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/common/PageTitle';

import { CompactServerStatus } from './components/CompactServerStatus';
import { ServerCharts } from './components/ServerCharts';
import { useCollections } from '@/features/collections/hooks/useCollections';
import type {
  ServerStatus,
  ServerAction,
  ServerMetrics as ServerMetricsType,
} from './types';
import type { Collection } from '@/features/collections/types';

// Mock historical data - replace with real API calls
const generateMockMetrics = (): ServerMetricsType[] => {
  const now = Date.now();
  const data: ServerMetricsType[] = [];

  for (let i = 23; i >= 0; i--) {
    const timestamp = now - i * 60 * 60 * 1000; // hourly data for 24 hours
    const baseLoad = Math.sin(((24 - i) / 24) * Math.PI * 2) * 20 + 50; // simulate daily pattern

    data.push({
      timestamp,
      players: Math.max(0, Math.floor(baseLoad / 3 + Math.random() * 10)),
      cpu: Math.max(10, Math.min(90, baseLoad + Math.random() * 20 - 10)),
      memory: Math.max(20, Math.min(85, baseLoad * 0.8 + Math.random() * 15 - 7.5)),
    });
  }

  return data;
};

export function ServerControlPanel() {
  const { setCurrentPage } = useNavigation();
  const { collections } = useCollections();
  const [selectedStartupCollection, setSelectedStartupCollection] =
    useState<Collection | null>(null);

  const [server, setServer] = useState<ServerStatus>({
    name: 'My ARMA 3 Server',
    status: 'online',
    uptime: 234567,
    players: 1,
    maxPlayers: 64,
    mission: 'Altis Life',
    lastRestart: '2 days ago',
    cpu: 26,
    memory: 30,
    mods: 43,
    version: '2.18.151618',
    activeCollection: {
      id: 1,
      name: 'Combat Enhancement',
    },
  });

  // Set the selected collection when collections are loaded and server has an active collection
  useEffect(() => {
    if (collections.length > 0 && server.activeCollection) {
      const activeCollection = collections.find(
        (c) => c.id === server.activeCollection?.id
      );
      if (activeCollection) {
        setSelectedStartupCollection(activeCollection);
      }
    }
  }, [collections, server.activeCollection]);

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [metricsHistory] = useState<ServerMetricsType[]>(generateMockMetrics());

  const handleServerAction = async (action: ServerAction, collectionId?: number) => {
    setIsLoading(action);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if ((action === 'start' || action === 'restart') && collectionId) {
      const collection = collections.find((c) => c.id === collectionId);
      console.log(
        `${action === 'start' ? 'Starting' : 'Restarting'} server with collection: ${collection?.name || 'Unknown'}`
      );

      setServer((prev) => ({
        ...prev,
        status: 'starting',
        activeCollection: collection
          ? {
              id: collection.id,
              name: collection.name,
            }
          : undefined,
      }));
    } else {
      setServer((prev) => ({
        ...prev,
        status:
          action === 'start' ? 'starting' : action === 'stop' ? 'stopping' : 'starting',
        ...(action === 'stop' && { activeCollection: undefined }),
      }));
    }

    setIsLoading(null);
  };

  const handleStartupCollectionChange = (collection: Collection | null) => {
    setSelectedStartupCollection(collection);
  };

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
