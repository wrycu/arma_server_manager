import {
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconDownload,
  IconFolder,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ServerStatus, ServerAction } from './types';

interface ServerControlsProps {
  server: ServerStatus;
  isLoading: string | null;
  onServerAction: (action: ServerAction) => void;
  onNavigateToMods: () => void;
  onNavigateToCollections: () => void;
}

export function ServerControls({
  server,
  isLoading,
  onServerAction,
  onNavigateToMods,
  onNavigateToCollections,
}: ServerControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Controls</CardTitle>
        <CardDescription>Manage server lifecycle and resources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onServerAction('restart')}
                disabled={isLoading === 'restart'}
              >
                <IconRefresh className="size-4 mr-2" />
                {isLoading === 'restart' ? 'Restarting...' : 'Restart Server'}
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="lg"
              className="w-full h-12 bg-green-600 hover:bg-green-700"
              onClick={() => onServerAction('start')}
              disabled={isLoading === 'start'}
            >
              <IconPlayerPlay className="size-5 mr-2" />
              {isLoading === 'start' ? 'Starting...' : 'Start Server'}
            </Button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={onNavigateToMods}
          >
            <IconDownload className="size-4 mr-2" />
            Update Mods
          </Button>
          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={onNavigateToCollections}
          >
            <IconFolder className="size-4 mr-2" />
            Manage Collections
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
