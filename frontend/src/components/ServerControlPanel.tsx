import { useState } from 'react';
import { useNavigation } from '../hooks/use-navigation';
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconTerminal,
  IconUsers,
  IconClock,
  IconAlertTriangle,
  IconServer,
  IconSettings,
  IconActivity,
  IconDownload,
  IconFolder,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ServerStatus {
  name: string;
  status: 'online' | 'offline' | 'starting' | 'stopping';
  uptime?: number;
  players: number;
  maxPlayers: number;
  mission?: string;
  lastRestart?: string;
  cpu: number;
  memory: number;
  mods: number;
  version: string;
}

export function ServerControlPanel() {
  const { setCurrentPage } = useNavigation();
  const [server, setServer] = useState<ServerStatus>({
    name: 'ARMA 3 Server',
    status: 'online',
    uptime: 234567,
    players: 24,
    maxPlayers: 64,
    mission: 'Altis Life',
    lastRestart: '2 days ago',
    cpu: 65,
    memory: 78,
    mods: 43,
    version: '2.18.151618',
  });

  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleServerAction = async (action: 'start' | 'stop' | 'restart') => {
    setIsLoading(action);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setServer((prev) => ({
      ...prev,
      status:
        action === 'start' ? 'starting' : action === 'stop' ? 'stopping' : 'starting',
    }));

    setIsLoading(null);
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

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`size-4 rounded-full ${getStatusColor(server.status)}`} />
          <h2 className="text-3xl font-bold tracking-tight">{server.name}</h2>
          {getStatusBadge(server.status)}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentPage('server-configs')}>
            <IconSettings className="size-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline">
            <IconTerminal className="size-4 mr-2" />
            Console
          </Button>
        </div>
      </div>

      <Alert>
        <IconAlertTriangle className="h-4 w-4" />
        <AlertTitle>Scheduled Maintenance</AlertTitle>
        <AlertDescription>
          Server restart scheduled for maintenance in 4 hours. Players will receive
          warnings.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconActivity className="size-5" />
              Server Status
            </CardTitle>
            <CardDescription>Current server performance and activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <IconUsers className="size-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{server.players}</div>
                <div className="text-sm text-muted-foreground">
                  of {server.maxPlayers} players
                </div>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <IconClock className="size-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">
                  {server.uptime ? formatUptime(server.uptime) : 'Offline'}
                </div>
                <div className="text-sm text-muted-foreground">uptime</div>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <IconFolder className="size-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{server.mods}</div>
                <div className="text-sm text-muted-foreground">active mods</div>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <IconServer className="size-5 text-muted-foreground" />
                </div>
                <div className="text-lg font-bold">{server.version}</div>
                <div className="text-sm text-muted-foreground">version</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>CPU Usage</span>
                  <span>{server.cpu}%</span>
                </div>
                <Progress value={server.cpu} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span>{server.memory}%</span>
                </div>
                <Progress value={server.memory} className="h-2" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">
                Current Mission:{' '}
                <span className="font-medium text-foreground">
                  {server.mission || 'No mission loaded'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Last restart: {server.lastRestart}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Controls</CardTitle>
            <CardDescription>Manage server lifecycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {server.status === 'online' ? (
                <>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleServerAction('stop')}
                    disabled={isLoading === 'stop'}
                  >
                    <IconPlayerStop className="size-4 mr-2" />
                    {isLoading === 'stop' ? 'Stopping...' : 'Stop Server'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleServerAction('restart')}
                    disabled={isLoading === 'restart'}
                  >
                    <IconRefresh className="size-4 mr-2" />
                    {isLoading === 'restart' ? 'Restarting...' : 'Restart Server'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleServerAction('start')}
                  disabled={isLoading === 'start'}
                >
                  <IconPlayerPlay className="size-4 mr-2" />
                  {isLoading === 'start' ? 'Starting...' : 'Start Server'}
                </Button>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={() => setCurrentPage('mod-management')}
              >
                <IconDownload className="size-4 mr-2" />
                Update Mods
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={() => setCurrentPage('collections')}
              >
                <IconFolder className="size-4 mr-2" />
                Manage Collections
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
