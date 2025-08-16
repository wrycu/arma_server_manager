import { createFileRoute } from '@tanstack/react-router'
import { ServerConfigEditor } from '@/components/ServerConfigEditor'

export const Route = createFileRoute('/server-configs')({
  component: ServerConfigEditor,
})
