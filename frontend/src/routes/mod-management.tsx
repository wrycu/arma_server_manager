import { createFileRoute } from '@tanstack/react-router'
import { InstalledModsManager } from '@/pages/ModsPage'

export const Route = createFileRoute('/mod-management')({
  component: InstalledModsManager,
})
