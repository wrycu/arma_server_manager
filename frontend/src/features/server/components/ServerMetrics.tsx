import { IconUsers, IconActivity, IconClock, IconPuzzle } from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ServerStatus } from '../types';

interface ServerMetricsProps {
  server: ServerStatus;
}

export function ServerMetrics({ server }: ServerMetricsProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconActivity className="size-5" />
          Server Metrics
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <div className={`size-2 rounded-full ${getStatusColor(server.status)}`} />
          {getStatusBadge(server.status)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IconUsers className="size-5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{server.players}</div>
            <div className="text-sm text-muted-foreground">
              of {server.maxPlayers} players
            </div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IconClock className="size-5 text-muted-foreground" />
            </div>
            <div className="text-lg font-bold">
              {server.uptime ? formatUptime(server.uptime) : 'Offline'}
            </div>
            <div className="text-sm text-muted-foreground">uptime</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IconPuzzle className="size-5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{server.mods}</div>
            <div className="text-sm text-muted-foreground">active mods</div>
          </div>
        </div>

        {/* Server Info */}
        <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
          <div className="flex justify-between">
            <span>Version:</span>
            <span className="font-medium text-foreground">{server.version}</span>
          </div>
          <div className="flex justify-between">
            <span>Mission:</span>
            <span className="font-medium text-foreground">
              {server.mission || 'No mission loaded'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Last restart:</span>
            <span className="font-medium text-foreground">{server.lastRestart}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
