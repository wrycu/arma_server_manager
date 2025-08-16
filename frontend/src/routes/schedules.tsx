import { createFileRoute } from '@tanstack/react-router'
import { SchedulesManager } from '@/pages/SchedulesPage'

export const Route = createFileRoute('/schedules')({
  component: SchedulesManager,
})
