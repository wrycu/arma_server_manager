import { ServerControlPanel } from '@/features/server';
import { ServerConfigEditor } from '@/features/server/components/ServerConfigEditor';
import { InstalledModsManager } from '@/features/mods';
import { CollectionManager } from '@/features/collections';
import { Settings } from '@/features/settings';
import { useNavigation } from '@/hooks/use-navigation';

export function MainContent() {
  const { currentPage } = useNavigation();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'server-control':
        return <ServerControlPanel />;
      case 'mod-management':
        return <InstalledModsManager />;
      case 'collections':
        return <CollectionManager />;
      case 'server-configs':
        return <ServerConfigEditor />;
      case 'settings':
        return <Settings />;
      default:
        return <ServerControlPanel />;
    }
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-6 py-12 md:gap-8 md:py-14">
        <div className="px-6 lg:px-8">{renderCurrentPage()}</div>
      </div>
    </div>
  );
}
