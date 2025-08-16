import { createFileRoute } from '@tanstack/react-router'
import { ServerControlPanel } from '@/pages/ServerPage'

export const Route = createFileRoute('/')({
  component: ServerControlPanel,
})
