import { ServerControlPanel } from '@/pages/ServerPage'
import { ServerConfigEditor } from '@/components/ServerConfigEditor'
import { SubscribedModsManager } from '@/pages/ModsPage'
import { CollectionManager } from '@/pages/CollectionsPage'
import { SchedulesManager } from '@/pages/SchedulesPage'
import { Settings } from '@/pages/SettingsPage'
import { useNavigation } from '@/hooks/useNavigation'

export function MainContent() {
  const { currentPage } = useNavigation()

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'server-control':
        return <ServerControlPanel />
      case 'mod-subscriptions':
        return <SubscribedModsManager />
      case 'collections':
        return <CollectionManager />
      case 'schedules':
        return <SchedulesManager />
      case 'server-configs':
        return <ServerConfigEditor />
      case 'settings':
        return <Settings />
      default:
        return <ServerControlPanel />
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-6 py-12 md:gap-8 md:py-14">
        <div className="px-6 lg:px-8">{renderCurrentPage()}</div>
      </div>
    </div>
  )
}
