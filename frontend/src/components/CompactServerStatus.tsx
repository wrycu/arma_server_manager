import {
  IconServer,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconSettings,
  IconTrash,
  IconDots,
} from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CollectionSelector } from '@/components/ServerCollectionSelector'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/date'
import { useNavigate } from '@tanstack/react-router'
import type { Collection } from '@/types/collections'
import type { ServerConfig } from '@/types/server'
import type { ServerActionRequest, ServerStatusResponse } from '@/types/api'

interface CompactServerStatusProps {
  server: ServerConfig | null
  serverStatus?: ServerStatusResponse | null
  isLoading: boolean
  collections: Collection[]
  selectedStartupCollection: Collection | null
  onServerAction: (action: ServerActionRequest, collectionId?: number) => void
  onStartupCollectionChange: (collection: Collection | null) => void
  onDeleteServer?: () => void
}

export function CompactServerStatus({
  server,
  serverStatus,
  isLoading: _isLoading,
  collections,
  selectedStartupCollection,
  onServerAction,
  onStartupCollectionChange,
  onDeleteServer,
}: CompactServerStatusProps) {
  const navigate = useNavigate()

  if (!server) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <IconServer className="size-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No Server Configured</h3>
              <p className="text-muted-foreground">
                Get started by creating your first ARMA 3 server configuration
              </p>
            </div>
            <div className="flex justify-center">
              <Button onClick={() => navigate({ to: '/settings' })}>Get Started</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mock server status - in a real implementation this would come from props
  const isServerRunning = serverStatus?.status === 'online' || false

  // Determine available actions based on server state
  const canStart = !isServerRunning
  const canStop = isServerRunning
  const canRestart = true // Always allow restart

  const handleServerAction = (action: 'start' | 'stop' | 'restart') => {
    const actionRequest: ServerActionRequest = {
      action,
      collectionId: selectedStartupCollection?.id,
    }
    onServerAction(actionRequest, selectedStartupCollection?.id)
  }

  return (
    <Card className="overflow-hidden">
      {/* Clean Header with Server Icon and Name */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <IconServer className="size-6 text-primary" />
            {server.server_name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isServerRunning && <Badge variant="default">Running</Badge>}
            {server.is_active && <Badge variant="secondary">Active</Badge>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconDots className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
                  <IconSettings className="size-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                {onDeleteServer && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDeleteServer} variant="destructive">
                      <IconTrash className="size-4 mr-2" />
                      Delete Server
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Server Details */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Max Players</div>
            <div className="font-medium">{server.max_players}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="text-sm">
              {server.is_active ? (
                <span className="text-green-600">Active configuration</span>
              ) : (
                <span className="text-amber-600">Inactive - will be activated when starting</span>
              )}
            </div>
          </div>
        </div>

        {/* Mod Collection Section */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Mod Collection</div>
            <div className="text-xs text-muted-foreground">
              Collection selection not yet integrated with server actions
            </div>
          </div>
          <CollectionSelector
            server={server}
            collections={collections}
            selectedStartupCollection={selectedStartupCollection}
            onStartupCollectionChange={onStartupCollectionChange}
          />
        </div>

        {/* Server Actions */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">Server Actions</div>
          <div className="flex gap-2 flex-wrap">
            {canStart && (
              <Button onClick={() => handleServerAction('start')} size="sm" variant="default">
                <IconPlayerPlay className="size-4 mr-1" />
                Start
              </Button>
            )}
            {canStop && (
              <Button onClick={() => handleServerAction('stop')} size="sm" variant="destructive">
                <IconPlayerStop className="size-4 mr-1" />
                Stop
              </Button>
            )}
            {canRestart && (
              <Button onClick={() => handleServerAction('restart')} size="sm" variant="outline">
                <IconRefresh className="size-4 mr-1" />
                Restart
              </Button>
            )}
          </div>
        </div>

        {/* Footer with timestamps */}
        <div className="pt-4 border-t border-border/30">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Created {formatDate(server.created_at)}</span>
            <span>Updated {formatDate(server.updated_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
