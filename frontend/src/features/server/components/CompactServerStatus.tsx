import {
  IconServer,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
} from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CollectionSelector } from './CollectionSelector';
import type { ServerStatus, ServerAction } from '../types';
import type { Collection } from '@/features/collections/types';

interface CompactServerStatusProps {
  server: ServerStatus;
  isLoading: string | null;
  collections: Collection[];
  selectedStartupCollection: Collection | null;
  onServerAction: (action: ServerAction, collectionId?: number) => void;
  onStartupCollectionChange: (collection: Collection | null) => void;
}

export function CompactServerStatus({
  server,
  isLoading,
  collections,
  selectedStartupCollection,
  onServerAction,
  onStartupCollectionChange,
}: CompactServerStatusProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'starting':
        return 'bg-yellow-500';
      case 'stopping':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'starting':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Starting</Badge>;
      case 'stopping':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Stopping</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Enhanced Header with Better Visual Hierarchy */}
      <CardHeader className="pb-6 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center gap-2.5">
                <IconServer className="size-5 text-muted-foreground" />
                {server.name}
              </div>
            </CardTitle>
            <CardDescription className="text-sm">
              ARMA 3 Server • Version {server.version}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`size-3 rounded-full ${getStatusColor(server.status)} shadow-sm`}
            />
            {getStatusBadge(server.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-6 flex-1">
          {/* Resource Usage Progress Bars */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CPU Usage</span>
                <span className="font-medium">{server.cpu}%</span>
              </div>
              <Progress value={server.cpu} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Memory Usage</span>
                <span className="font-medium">{server.memory}%</span>
              </div>
              <Progress value={server.memory} className="h-2" />
            </div>
          </div>

          {/* Server Information - Compact & Clean */}
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Players: </span>
                <span className="font-medium">
                  {server.players}/{server.maxPlayers}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Uptime: </span>
                <span className="font-medium">
                  {server.uptime ? formatUptime(server.uptime) : 'Offline'}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Mods loaded: </span>
                <span className="font-medium">{server.mods}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Last restart: </span>
                <span className="font-medium">{server.lastRestart}</span>
              </div>
              <div className="text-sm col-span-2">
                <span className="text-muted-foreground">Mission: </span>
                <span className="font-medium">
                  {server.mission || 'No mission loaded'}
                </span>
              </div>
              {server.activeCollection && (
                <div className="text-sm col-span-2">
                  <span className="text-muted-foreground">Active collection: </span>
                  <Badge variant="secondary" className="text-xs ml-1">
                    {server.activeCollection.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Server Content Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Server Configuration</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select the mod collection to load when starting the server
              </p>
            </div>
            <CollectionSelector
              server={server}
              collections={collections}
              selectedStartupCollection={selectedStartupCollection}
              onStartupCollectionChange={onStartupCollectionChange}
            />
          </div>
        </div>

        {/* Server Controls - Enhanced Button Layout */}
        <div className="pt-6 mt-auto">
          <div className="flex gap-3">
            {server.status === 'online' ? (
              <>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onServerAction('stop')}
                  disabled={isLoading === 'stop'}
                >
                  <IconPlayerStop className="size-4 mr-2" />
                  {isLoading === 'stop' ? 'Stopping...' : 'Stop Server'}
                </Button>

                {selectedStartupCollection &&
                selectedStartupCollection.id !== server.activeCollection?.id ? (
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() =>
                      onServerAction('restart', selectedStartupCollection.id)
                    }
                    disabled={isLoading === 'restart'}
                  >
                    <IconRefresh className="size-4 mr-2" />
                    {isLoading === 'restart' ? 'Applying...' : 'Apply & Restart'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onServerAction('restart')}
                    disabled={isLoading === 'restart'}
                  >
                    <IconRefresh className="size-4 mr-2" />
                    {isLoading === 'restart' ? 'Restarting...' : 'Restart'}
                  </Button>
                )}
              </>
            ) : server.status === 'starting' ? (
              <Button variant="outline" className="w-full" disabled={true}>
                <IconPlayerPlay className="size-4 mr-2" />
                Starting Server...
              </Button>
            ) : server.status === 'stopping' ? (
              <Button variant="outline" className="w-full" disabled={true}>
                <IconPlayerStop className="size-4 mr-2" />
                Stopping Server...
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onServerAction('start', selectedStartupCollection?.id)}
                disabled={isLoading === 'start'}
              >
                <IconPlayerPlay className="size-4 mr-2" />
                {isLoading === 'start' ? 'Starting...' : 'Start Server'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
