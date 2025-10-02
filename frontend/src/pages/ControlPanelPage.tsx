import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { PageTitle } from '@/components/PageTitle'
import { CompactServerStatus } from '@/components/CompactServerStatus'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { useCollections } from '@/hooks/useCollections'
import { useServer } from '@/hooks/useServer'
import { serverService } from '@/services/server.service'
import type { Collection } from '@/types/collections'
import type { ServerActionRequest, ServerStatusResponse } from '@/types/api'

export function ControlPanelPage() {
  const { collections } = useCollections()
  const { servers, isServersLoading, refetchServers } = useServer()

  // Get the first (and only) server
  const server = servers?.[0] || null

  const [selectedStartupCollection, setSelectedStartupCollection] = useState<Collection | null>(
    null
  )

  // Mock server status - real status checking not yet implemented
  const [serverStatus] = useState<ServerStatusResponse | null>(null)

  // Confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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

  const handleDeleteServer = () => {
    if (!server) return
    setShowDeleteDialog(true)
  }

  const confirmDeleteServer = async () => {
    if (!server) return

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
        onDeleteServer={handleDeleteServer}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Server"
        description={`Are you sure you want to delete server "${server?.server_name}"? This action cannot be undone.`}
        confirmText="Delete Server"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteServer}
      />
    </div>
  )
}
