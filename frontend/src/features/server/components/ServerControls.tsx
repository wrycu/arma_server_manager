import { IconPlayerPlay, IconPlayerStop, IconRefresh } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CollectionSelector } from './CollectionSelector';
import type { ServerStatus, ServerAction } from '../types';
import type { Collection } from '@/features/collections/types';

interface ServerControlsProps {
  server: ServerStatus;
  isLoading: string | null;
  collections: Collection[];
  selectedStartupCollection: Collection | null;
  onServerAction: (action: ServerAction, collectionId?: number) => void;
  onStartupCollectionChange: (collection: Collection | null) => void;
}

export function ServerControls({
  server,
  isLoading,
  collections,
  selectedStartupCollection,
  onServerAction,
  onStartupCollectionChange,
}: ServerControlsProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Server Controls</CardTitle>
        <CardDescription>Manage server lifecycle and resources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Primary Controls */}
        <div className="space-y-3">
          {server.status === 'online' ? (
            <>
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-12"
                onClick={() => onServerAction('stop')}
                disabled={isLoading === 'stop'}
              >
                <IconPlayerStop className="size-5 mr-2" />
                {isLoading === 'stop' ? 'Stopping...' : 'Stop Server'}
              </Button>

              {/* Show restart with collection button if different collection is selected */}
              {selectedStartupCollection &&
              selectedStartupCollection.id !== server.activeCollection?.id ? (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() =>
                    onServerAction('restart', selectedStartupCollection.id)
                  }
                  disabled={isLoading === 'restart'}
                >
                  <IconRefresh className="size-4 mr-2" />
                  {isLoading === 'restart' ? 'Restarting...' : 'Restart to Apply'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onServerAction('restart')}
                  disabled={isLoading === 'restart'}
                >
                  <IconRefresh className="size-4 mr-2" />
                  {isLoading === 'restart' ? 'Restarting...' : 'Restart Server'}
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="default"
              size="lg"
              className="w-full h-12 bg-green-600 hover:bg-green-700"
              onClick={() => onServerAction('start', selectedStartupCollection?.id)}
              disabled={isLoading === 'start'}
            >
              <IconPlayerPlay className="size-5 mr-2" />
              {isLoading === 'start' ? 'Starting...' : 'Start Server'}
            </Button>
          )}
        </div>

        {/* Server Content Section */}
        <div className="pt-4 border-t space-y-3 mt-auto">
          <div className="space-y-2">
            <CardTitle className="text-base">Server Content</CardTitle>
            <CardDescription>
              Select which collection of mods to load when starting the server
            </CardDescription>
            <CollectionSelector
              server={server}
              collections={collections}
              selectedStartupCollection={selectedStartupCollection}
              onStartupCollectionChange={onStartupCollectionChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
