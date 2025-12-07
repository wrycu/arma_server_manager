import { createFileRoute } from '@tanstack/react-router'
import { ModsPage } from '@/pages/ModsPage'

type ModsSearch = {
  tab?: string
  modId?: number
}

export const Route = createFileRoute('/arma3/mods/')({
  component: ModsPage,
  validateSearch: (search: Record<string, unknown>): ModsSearch => {
    return {
      tab: typeof search.tab === 'string' ? search.tab : undefined,
      modId: typeof search.modId === 'number' ? search.modId : undefined,
    }
  },
})
