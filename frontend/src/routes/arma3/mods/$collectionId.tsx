import { createFileRoute } from '@tanstack/react-router'
import { CollectionDetailPage } from '@/pages/CollectionDetailPage'

export const Route = createFileRoute('/arma3/mods/$collectionId')({
  component: CollectionDetailPage,
})
