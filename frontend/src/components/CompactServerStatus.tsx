import {
  IconServer,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconDeviceFloppy,
  IconSettings,
} from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { CollectionSelector } from '@/components/ServerCollectionSelector'
import { ServerSettings } from '@/components/ServerSettings'
import { useNavigate } from '@tanstack/react-router'
import type { Collection } from '@/types/collections'
import type { ServerConfig } from '@/types/server'
import type { ServerActionRequest, ServerStatusResponse } from '@/types/api'
import type { ServerConfiguration } from '@/types/settings'

interface CompactServerStatusProps {
  server: ServerConfig | null
  serverStatus?: ServerStatusResponse | null
  isServerRunning?: boolean
  isLoading: boolean
  collections: Collection[]
  selectedStartupCollection: Collection | null
  onServerAction: (action: ServerActionRequest, collectionId?: number) => void
  onStartupCollectionChange: (collection: Collection | null) => void
  serverSettings?: ServerConfiguration
  isSettingsOpen?: boolean
  isSaving?: boolean
  onSettingsOpenChange?: (open: boolean) => void
  onServerSettingsUpdate?: (settings: ServerConfiguration) => void
  onSaveServerSettings?: () => void
}

export function CompactServerStatus({
  server,
  serverStatus,
  isServerRunning,
  isLoading: _isLoading,
  collections,
  selectedStartupCollection,
  onServerAction,
  onStartupCollectionChange,
  serverSettings,
  isSettingsOpen = false,
  isSaving = false,
  onSettingsOpenChange,
  onServerSettingsUpdate,
  onSaveServerSettings,
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

  const derivedServerRunning =
    typeof isServerRunning === 'boolean'
      ? isServerRunning
      : serverStatus?.status === 'online' || false

  // Determine available actions based on server state
  const canStart = !derivedServerRunning
  const canStop = derivedServerRunning
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
        <CardTitle className="flex items-center gap-3 text-2xl">
          <IconServer className="size-6 text-primary" />
          {server.server_name}
        </CardTitle>
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
              {derivedServerRunning ? (
                <span className="text-green-600">Server is running</span>
              ) : (
                <span className="text-amber-600">Server is offline</span>
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

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pt-4 -mx-6 -mb-6 px-4 pb-8 mt-4">
          {/* Settings Toggle - Bottom Left */}
          {serverSettings && onSettingsOpenChange && (
            <Button
              onClick={() => onSettingsOpenChange(!isSettingsOpen)}
              variant="ghost"
              size="sm"
              className={`flex items-center justify-center gap-2 h-8 ${
                isSettingsOpen
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <IconSettings className="h-4 w-4" />
              <span className="text-sm font-medium">Settings</span>
            </Button>
          )}

          {/* Server Actions - Bottom Right */}
          <div className="flex gap-2">
            {canStart && (
              <Button
                onClick={() => handleServerAction('start')}
                size="sm"
                variant="ghost"
                className="flex items-center justify-center h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <IconPlayerPlay className="size-4 mr-1" />
                Start
              </Button>
            )}
            {canStop && (
              <Button
                onClick={() => handleServerAction('stop')}
                size="sm"
                variant="ghost"
                className="flex items-center justify-center h-8 text-muted-foreground hover:text-foreground"
              >
                <IconPlayerStop className="size-4 mr-1" />
                Stop
              </Button>
            )}
            {canRestart && (
              <Button
                onClick={() => handleServerAction('restart')}
                size="sm"
                variant="ghost"
                className="flex items-center justify-center h-8 text-muted-foreground hover:text-foreground"
              >
                <IconRefresh className="size-4 mr-1" />
                Restart
              </Button>
            )}
          </div>
        </div>

        {/* Server Settings Drawer */}
        {serverSettings &&
          onSettingsOpenChange &&
          onServerSettingsUpdate &&
          onSaveServerSettings && (
            <Collapsible open={isSettingsOpen} onOpenChange={onSettingsOpenChange}>
              <div className="border-t -mx-6 -mb-6">
                <CollapsibleContent>
                  <div className="p-6 space-y-4">
                    <div className="text-sm font-semibold">Configuration</div>
                    <ServerSettings
                      settings={serverSettings}
                      onUpdate={onServerSettingsUpdate}
                      showCard={false}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        onClick={onSaveServerSettings}
                        disabled={
                          isSaving ||
                          !serverSettings.name ||
                          !serverSettings.server_name ||
                          !serverSettings.admin_password
                        }
                        className="flex items-center gap-2"
                      >
                        <IconDeviceFloppy className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
      </CardContent>
    </Card>
  )
}
