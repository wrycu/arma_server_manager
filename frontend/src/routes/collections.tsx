import { createFileRoute } from '@tanstack/react-router'
import { CollectionManager } from '@/pages/CollectionsPage'

export const Route = createFileRoute('/collections')({
  component: CollectionManager,
})
