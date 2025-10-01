import { createFileRoute } from '@tanstack/react-router'
import { CollectionDetailPage } from '@/pages/CollectionDetailPage'

export const Route = createFileRoute('/collections/$collectionId')({
  component: CollectionDetailPage,
})
