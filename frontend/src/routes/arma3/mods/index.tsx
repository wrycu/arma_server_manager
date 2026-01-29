import { createFileRoute } from '@tanstack/react-router'
import { ModsPage } from '@/pages/ModsPage'

export type ModsSearch = {
  tab?: 'collections' | 'subscriptions'
  modId?: number
}

export const Route = createFileRoute('/arma3/mods/')({
  component: ModsPage,
  validateSearch: (search: Record<string, unknown>): ModsSearch => {
    const tab = search.tab
    const modId = search.modId

    return {
      tab: tab === 'collections' || tab === 'subscriptions' ? tab : undefined,
      // Handle both number and string (URL params come as strings)
      modId:
        typeof modId === 'number'
          ? modId
          : typeof modId === 'string'
            ? parseInt(modId, 10) || undefined
            : undefined,
    }
  },
})
