import { createFileRoute } from '@tanstack/react-router'
import { ControlPanelPage } from '@/pages/ControlPanelPage'

export const Route = createFileRoute('/control-panel')({
  component: ControlPanelPage,
})
