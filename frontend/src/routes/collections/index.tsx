import { createFileRoute } from '@tanstack/react-router'
import { CollectionsListPage } from '@/pages/CollectionsListPage'

export const Route = createFileRoute('/collections/')({
  component: CollectionsListPage,
})
