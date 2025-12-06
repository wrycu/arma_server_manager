import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { PageTitle } from '@/components/PageTitle'
import { CompactServerStatus } from '@/components/CompactServerStatus'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { useCollections } from '@/hooks/useCollections'
import { useServer } from '@/hooks/useServer'
import { serverService } from '@/services/server.service'
import type { Collection } from '@/types/collections'
import type { ServerConfig } from '@/types/server'
import type { ServerActionRequest } from '@/types/api'

export function ControlPanelPage() {
  const { collections } = useCollections()
  const { servers, isServersLoading, refetchServers } = useServer()

  const [selectedStartupCollection, setSelectedStartupCollection] = useState<Collection | null>(
    null
  )
  const [serverPendingDelete, setServerPendingDelete] = useState<ServerConfig | null>(null)

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

  const handleDeleteServer = (serverToDelete: ServerConfig | null) => {
    if (!serverToDelete) return
    setServerPendingDelete(serverToDelete)
  }

  const confirmDeleteServer = async () => {
    if (!serverPendingDelete) return

    try {
      await serverService.deleteServer(serverPendingDelete.id)
      toast.success(`Server "${serverPendingDelete.server_name}" deleted successfully`)
      refetchServers()
    } catch (error) {
      console.error('Failed to delete server:', error)
      toast.error(
        `Failed to delete server: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      setServerPendingDelete(null)
    }
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
            onDeleteServer={server ? () => handleDeleteServer(server) : undefined}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={Boolean(serverPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setServerPendingDelete(null)
          }
        }}
        title="Delete Server"
        description={
          serverPendingDelete
            ? `Are you sure you want to delete server "${serverPendingDelete.server_name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this server? This action cannot be undone.'
        }
        confirmText="Delete Server"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteServer}
      />
    </div>
  )
}
