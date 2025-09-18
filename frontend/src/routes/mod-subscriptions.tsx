import { createFileRoute } from '@tanstack/react-router'
import { SubscribedModsManager } from '@/pages/ModsPage'

export const Route = createFileRoute('/mod-subscriptions')({
  component: SubscribedModsManager,
})
