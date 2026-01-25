import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { PageTitle } from '@/components/PageTitle'
import { CompactServerStatus } from '@/components/CompactServerStatus'
import { useCollections } from '@/hooks/useCollections'
import { useServer } from '@/hooks/useServer'
import { useSchedules } from '@/hooks/useSchedules'
import { serverService } from '@/services/server.service'
import { handleApiError } from '@/lib/error-handler'
import type { Collection } from '@/types/collections'
import type { ServerConfig, CreateServerRequest, Schedule } from '@/types/server'
import type { ServerActionRequest } from '@/types/api'
import type { ServerConfiguration } from '@/types/settings'

export function ControlPanelPage() {
  const { collections } = useCollections()
  const { servers, isServersLoading, refetchServers } = useServer(undefined, true)
  const {
    schedules,
    isLoading: isSchedulesLoading,
    createSchedule,
    updateSchedule,
    executeSchedule,
    deleteSchedule,
    isCreating: isCreatingSchedule,
  } = useSchedules()

  const [selectedStartupCollection, setSelectedStartupCollection] = useState<Collection | null>(
    null
  )
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [serverSettings, setServerSettings] = useState<ServerConfiguration>({
    name: '',
    description: '',
    server_name: '',
    password: '',
    admin_password: '',
    max_players: 32,
    mission_file: '',
    server_config_file: '',
    basic_config_file: '',
    server_mods: '',
    client_mods: '',
    additional_params: '',
    server_binary: '',
  })

  // Schedules state
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [isSchedulesOpen, setIsSchedulesOpen] = useState(false)
  const [isScheduleSidebarOpen, setIsScheduleSidebarOpen] = useState(false)

  // Track if we've done the initial population of server settings
  const hasInitializedSettings = useRef(false)

  // Refetch server data when component mounts to ensure fresh data
  useEffect(() => {
    refetchServers()
  }, [refetchServers])

  // Set the selected collection when collections are loaded
  useEffect(() => {
    if (collections.length > 0 && !selectedStartupCollection) {
      setSelectedStartupCollection(collections[0])
    }
  }, [collections, selectedStartupCollection])

  // Load server settings only once when servers are first available
  // This prevents form state from being overwritten during refetches
  useEffect(() => {
    if (!isServersLoading && servers.length > 0 && !hasInitializedSettings.current) {
      const server = servers[0]
      setServerSettings({
        name: server.name || '',
        description: server.description || '',
        server_name: server.server_name || '',
        password: server.password || '',
        admin_password: server.admin_password || '',
        max_players: server.max_players || 32,
        mission_file: server.mission_file || '',
        server_config_file: server.server_config_file || '',
        basic_config_file: server.basic_config_file || '',
        server_mods: server.server_mods || '',
        client_mods: server.client_mods || '',
        additional_params: server.additional_params || '',
        server_binary: server.server_binary || '',
      })
      hasInitializedSettings.current = true
    }
  }, [servers, isServersLoading])

  const handleServerAction = async (
    server: ServerConfig | null,
    action: ServerActionRequest,
    _collectionId?: number
  ) => {
    if (!server) return
    try {
      const actionText =
        action.action === 'start' ? 'start' : action.action === 'stop' ? 'stop' : 'restart'

      toast.info(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ing server...`)

      const result = await serverService.performServerAction(action.action, _collectionId)

      toast.success(result.message)

      if (selectedStartupCollection) {
        toast.info(`Using collection: ${selectedStartupCollection.name}`)
      }

      // Refetch server data to get updated status
      refetchServers()
    } catch (error) {
      console.error(`Failed to ${action.action} server:`, error)
      toast.error(
        `Failed to ${action.action} server: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  const handleStartupCollectionChange = (collection: Collection | null) => {
    setSelectedStartupCollection(collection)
  }

  const handleServerSettingsUpdate = (settings: ServerConfiguration) => {
    setServerSettings(settings)
  }

  const handleSaveServerSettings = async () => {
    if (!servers.length) {
      toast.error('No server found to update')
      return
    }

    const server = servers[0]
    setIsSaving(true)

    try {
      const serverData: CreateServerRequest = {
        name: serverSettings.name,
        description: serverSettings.description || null,
        server_name: serverSettings.server_name,
        password: serverSettings.password || null,
        admin_password: serverSettings.admin_password,
        max_players: serverSettings.max_players,
        mission_file: serverSettings.mission_file || null,
        server_config_file: serverSettings.server_config_file || null,
        basic_config_file: serverSettings.basic_config_file || null,
        server_mods: serverSettings.server_mods || null,
        client_mods: serverSettings.client_mods || null,
        additional_params: serverSettings.additional_params || null,
        server_binary: serverSettings.server_binary,
      }

      await serverService.updateServer(server.id, serverData)
      toast.success('Server settings saved successfully!')
      // Reset the initialization flag so next refetch will update form state
      hasInitializedSettings.current = false
      refetchServers()
      setIsSettingsOpen(false)
    } catch (error) {
      console.error('Failed to save server settings:', error)
      handleApiError(error, 'Failed to save server settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Schedules handlers
  const handleCreateSchedule = async (scheduleData: {
    name: string
    action: string
    celeryName: string
  }) => {
    await createSchedule({
      name: scheduleData.name.trim(),
      action: scheduleData.action,
      celeryName: scheduleData.celeryName,
      enabled: true,
    })
  }

  const handleScheduleRowClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsScheduleSidebarOpen(true)
  }

  const handleScheduleSave = async (
    id: number,
    updates: {
      name: string
      action: string
      celeryName: string
      enabled: boolean
    }
  ) => {
    await updateSchedule(id, {
      name: updates.name.trim(),
      action: updates.action,
      celery_name: updates.celeryName,
      enabled: updates.enabled,
    })
    toast.success('Schedule updated successfully')
  }

  const handleScheduleExecute = async (id: number) => {
    await executeSchedule(id)
    toast.success('Schedule executed successfully')
  }

  const handleScheduleDelete = async (id: number) => {
    await deleteSchedule(id)
    setIsScheduleSidebarOpen(false)
    toast.success('Schedule deleted successfully')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageTitle title="Control Panel" description="Manage your ARMA server" />
        {isServersLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
        )}
      </div>

      {/* Server Management Panel */}
      <div className="space-y-4">
        {(servers.length ? servers : [null]).map((server, index) => (
          <CompactServerStatus
            key={server?.id ?? `server-card-${index}`}
            server={server}
            isServerRunning={server?.is_active ?? false}
            isLoading={false}
            collections={collections}
            selectedStartupCollection={selectedStartupCollection}
            onServerAction={(action, collectionId) =>
              handleServerAction(server, action, collectionId)
            }
            onStartupCollectionChange={handleStartupCollectionChange}
            serverSettings={server ? serverSettings : undefined}
            isSettingsOpen={isSettingsOpen}
            isSaving={isSaving}
            onSettingsOpenChange={setIsSettingsOpen}
            onServerSettingsUpdate={handleServerSettingsUpdate}
            onSaveServerSettings={handleSaveServerSettings}
            schedules={schedules}
            selectedSchedule={selectedSchedule}
            isSchedulesOpen={isSchedulesOpen}
            isSchedulesLoading={isSchedulesLoading}
            isCreatingSchedule={isCreatingSchedule}
            onSchedulesOpenChange={setIsSchedulesOpen}
            onScheduleRowClick={handleScheduleRowClick}
            onCreateSchedule={handleCreateSchedule}
            onScheduleSave={handleScheduleSave}
            onScheduleExecute={handleScheduleExecute}
            onScheduleDelete={handleScheduleDelete}
            isScheduleSidebarOpen={isScheduleSidebarOpen}
            onScheduleSidebarOpenChange={setIsScheduleSidebarOpen}
          />
        ))}
      </div>
    </div>
  )
}
