import { ServerControlPanel } from './ServerControlPanel';
import { InstalledModsManager } from './ModBrowser';
import { CollectionManager } from './CollectionManager';
import { ServerConfigEditor } from './ServerConfigEditor';
import { useNavigation } from '../hooks/use-navigation';

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
      default:
        return <ServerControlPanel />;
    }
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-6 py-6 md:gap-8 md:py-8">
        <div className="px-6 lg:px-8">{renderCurrentPage()}</div>
      </div>
    </div>
  );
}
