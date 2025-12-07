import { createFileRoute } from '@tanstack/react-router'
import { ModsPage } from '@/pages/ModsPage'

export const Route = createFileRoute('/arma3/mods/')({
  component: ModsPage,
})
