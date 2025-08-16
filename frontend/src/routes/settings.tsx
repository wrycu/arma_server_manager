import { createFileRoute } from '@tanstack/react-router'
import { Settings } from '@/pages/SettingsPage'

export const Route = createFileRoute('/settings')({
  component: Settings,
})
