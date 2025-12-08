import { createFileRoute } from '@tanstack/react-router'
import { ControlPanelPage } from '@/pages/ControlPanelPage'

export const Route = createFileRoute('/arma3/control-panel')({
  component: ControlPanelPage,
})
