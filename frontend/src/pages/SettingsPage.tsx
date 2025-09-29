import { useState, useEffect } from 'react'
import { IconBell, IconServer, IconDeviceFloppy, IconEye } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageTitle } from '@/components/PageTitle'
import { NotificationSettings } from '@/components/NotificationSettings'
import { ServerSettings } from '@/components/ServerSettings'
import { useServer } from '@/hooks/useServer'
import { serverService } from '@/services/server.service'
import type { SettingsData, SettingsTab } from '@/types/settings'
import type { ServerConfig, CreateServerRequest, UpdateServerRequest } from '@/types/server'

// Default initial data for new configurations
const getInitialSettings = (serverConfig?: ServerConfig): SettingsData => ({
  notifications: {
    enableNotifications: true,
    webhookUrl: '',
    notificationTypes: {
      serverStartStop: true,
      modUpdates: false,
      playerEvents: false,
    },
  },
  server: {
    name: serverConfig?.name || '',
    description: serverConfig?.description || '',
    server_name: serverConfig?.server_name || 'My ARMA 3 Server',
    password: serverConfig?.password || '',
    admin_password: serverConfig?.admin_password || '',
    max_players: serverConfig?.max_players || 32,
    mission_file: serverConfig?.mission_file || '',
    server_config_file: serverConfig?.server_config_file || '',
    basic_config_file: serverConfig?.basic_config_file || '',
    server_mods: serverConfig?.server_mods || '',
    client_mods: serverConfig?.client_mods || '',
    additional_params: serverConfig?.additional_params || '',
    server_binary: serverConfig?.server_binary || '',
  },
})

export function Settings() {
  const navigate = useNavigate()
  const { servers, isServersLoading } = useServer()
  const [settings, setSettings] = useState<SettingsData>(getInitialSettings())
  const [activeTab, setActiveTab] = useState<SettingsTab>('server')
  const [isLoading, setIsLoading] = useState(false)
  const [currentServerId, setCurrentServerId] = useState<number | null>(null)

  // Load server configuration when servers are available
  useEffect(() => {
    if (!isServersLoading && servers.length > 0) {
      const server = servers[0] // Use the first server as the primary config
      setCurrentServerId(server.id)
      setSettings(getInitialSettings(server))
    }
  }, [servers, isServersLoading])

  const handleNotificationUpdate = (notificationSettings: SettingsData['notifications']) => {
    setSettings((prev) => ({
      ...prev,
      notifications: notificationSettings,
    }))
  }

  const handleServerUpdate = (serverSettings: SettingsData['server']) => {
    setSettings((prev) => ({
      ...prev,
      server: serverSettings,
    }))
  }

  const handleCreateServer = async () => {
    setIsLoading(true)
    try {
      const serverData: CreateServerRequest = {
        name: settings.server.name,
        description: settings.server.description || null,
        server_name: settings.server.server_name,
        password: settings.server.password || null,
        admin_password: settings.server.admin_password,
        max_players: settings.server.max_players,
        mission_file: settings.server.mission_file || null,
        server_config_file: settings.server.server_config_file || null,
        basic_config_file: settings.server.basic_config_file || null,
        server_mods: settings.server.server_mods || null,
        client_mods: settings.server.client_mods || null,
        additional_params: settings.server.additional_params || null,
        server_binary: settings.server.server_binary,
      }

      const response = await serverService.createServer(serverData)
      setCurrentServerId(response.result)
      toast.success('Server configuration created successfully!')
    } catch (error) {
      console.error('Failed to create server configuration:', error)
      toast.error(
        `Failed to create server: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateServer = async () => {
    if (!currentServerId) return

    setIsLoading(true)
    try {
      const serverData: UpdateServerRequest = {
        name: settings.server.name,
        description: settings.server.description || null,
        server_name: settings.server.server_name,
        password: settings.server.password || null,
        admin_password: settings.server.admin_password,
        max_players: settings.server.max_players,
        mission_file: settings.server.mission_file || null,
        server_config_file: settings.server.server_config_file || null,
        basic_config_file: settings.server.basic_config_file || null,
        server_mods: settings.server.server_mods || null,
        client_mods: settings.server.client_mods || null,
        additional_params: settings.server.additional_params || null,
        server_binary: settings.server.server_binary,
      }

      await serverService.updateServer(currentServerId, serverData)
      toast.success('Server configuration updated successfully!')
    } catch (error) {
      console.error('Failed to update server configuration:', error)
      toast.error(
        `Failed to update server: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (currentServerId) {
      await handleUpdateServer()
    } else {
      await handleCreateServer()
    }
  }

  if (isServersLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="bg-background/95 backdrop-blur">
          <PageTitle title="Settings" description="Configure your server manager preferences" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading server configurations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <PageTitle
        title="Settings"
        description={
          currentServerId
            ? 'Configure your server manager preferences'
            : 'Configure your server manager preferences - create your first server configuration below'
        }
      />

      <div className="py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)}>
          <TabsList className="w-fit mb-6">
            <TabsTrigger value="server" className="flex items-center gap-2">
              <IconServer className="h-4 w-4" />
              Server
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <IconBell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="server">
            <ServerSettings settings={settings.server} onUpdate={handleServerUpdate} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings
              settings={settings.notifications}
              onUpdate={handleNotificationUpdate}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          {currentServerId && (
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/control-panel' })}
              className="flex items-center gap-2"
            >
              <IconEye className="h-4 w-4" />
              View
            </Button>
          )}
          <Button
            onClick={handleSaveSettings}
            disabled={
              isLoading ||
              !settings.server.name ||
              !settings.server.server_name ||
              !settings.server.admin_password
            }
            className="flex items-center gap-2"
          >
            <IconDeviceFloppy className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
