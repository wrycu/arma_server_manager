import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { IconPlus } from '@tabler/icons-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/PageTitle'

import { useCollections } from '@/hooks/useCollections'
import { useServer } from '@/hooks/useServer'
import { serverService } from '@/services/server.service'
import { CreateCollectionDialog } from '@/components/CollectionsCreateDialog'
import CollectionsList from '@/components/CollectionsList'
import type { Collection } from '@/types/collections'

export function CollectionsListPage() {
  const navigate = useNavigate()
  const { collections, createCollection, deleteCollection } = useCollections()

  const { servers, refetchServers } = useServer()
  const server = servers?.[0] || null

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateCollection = (newCollection: { name: string; description: string }) => {
    createCollection(newCollection)
  }

  const handleSelectCollection = (collection: Collection) => {
    navigate({ to: `/collections/${collection.id}` })
  }

  const handleSetActiveCollection = async (collection: Collection) => {
    if (!server) {
      toast.error('No server configuration found')
      return
    }

    try {
      await serverService.updateServerCollectionId(server.id, collection.id)
      toast.success(`Set "${collection.name}" as active collection`)
      // Refetch server data to get updated collection_id
      refetchServers()
    } catch (error) {
      console.error('Failed to set active collection:', error)
      toast.error(
        `Failed to set active collection: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="bg-background/95 backdrop-blur">
        <PageTitle
          title="Collections"
          description="Manage your mod collections"
          actions={
            <CreateCollectionDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onCreate={handleCreateCollection}
              trigger={
                <Button size="xs">
                  <IconPlus className="h-4 w-4" />
                  New
                </Button>
              }
            />
          }
        />
      </div>

      <div className="flex-1 overflow-auto py-6">
        <CollectionsList
          collections={collections}
          onSelectCollection={handleSelectCollection}
          onDeleteCollection={deleteCollection}
          onSetActive={handleSetActiveCollection}
          server={server}
        />
      </div>

      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateCollection}
      />
    </div>
  )
}
