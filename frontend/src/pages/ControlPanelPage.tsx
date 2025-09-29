import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { PageTitle } from '@/components/PageTitle'
import { CompactServerStatus } from '@/components/CompactServerStatus'
import { useCollections } from '@/hooks/useCollections'
import { useServer } from '@/hooks/useServer'
import { serverService } from '@/services/server.service'
import type { Collection } from '@/types/collections'
import type { ServerActionRequest } from '@/types/api'

export function ControlPanelPage() {
  const { collections } = useCollections()
  const { servers, isServersLoading, refetchServers } = useServer()

  // Get the first (and only) server
  const server = servers?.[0] || null

  const [selectedStartupCollection, setSelectedStartupCollection] = useState<Collection | null>(
    null
  )

  // Mock server status - real status checking not yet implemented
  const [serverStatus] = useState<{
    status: 'online' | 'offline'
    activeCollection?: { id: number; name: string } | null
  }>({
    status: 'offline',
    activeCollection: null,
  })

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

  const handleServerAction = async (action: ServerActionRequest, _collectionId?: number) => {
    if (!server) return

    // Mock the server action with toast notification
    const actionText =
      action.action === 'start'
        ? 'server start'
        : action.action === 'stop'
          ? 'server stop'
          : 'server restart'

    toast.info(`Would send immediate ${actionText} task`)

    if (selectedStartupCollection) {
      toast.info(`Would use collection: ${selectedStartupCollection.name}`)
    }
  }

  const handleStartupCollectionChange = (collection: Collection | null) => {
    setSelectedStartupCollection(collection)
  }

  const handleViewDetails = () => {
    if (server) {
      toast.info('Server settings page not yet implemented')
    }
  }

  const handleDeleteServer = async () => {
    if (!server) return

    // Add confirmation
    if (
      !window.confirm(
        `Are you sure you want to delete server "${server.server_name}"? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      await serverService.deleteServer(server.id)
      toast.success(`Server "${server.server_name}" deleted successfully`)
      refetchServers()
    } catch (error) {
      console.error('Failed to delete server:', error)
      toast.error(
        `Failed to delete server: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  if (isServersLoading) {
    return (
      <div className="space-y-6">
        <PageTitle title="Control Panel" description="Manage your ARMA 3 server" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading server...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageTitle title="Control Panel" description="Manage your ARMA server" />

      {/* Server Management Panel */}
      <CompactServerStatus
        server={server}
        serverStatus={serverStatus}
        isLoading={false}
        collections={collections}
        selectedStartupCollection={selectedStartupCollection}
        onServerAction={handleServerAction}
        onStartupCollectionChange={handleStartupCollectionChange}
        onViewDetails={handleViewDetails}
        onDeleteServer={handleDeleteServer}
      />
    </div>
  )
}
