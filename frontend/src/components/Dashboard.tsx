import { SectionCards } from './section-cards';
import { ServerControlPanel } from './ServerControlPanel';
import { ModBrowser } from './ModBrowser';
import { CollectionManager } from './CollectionManager';
import { ServerConfigEditor } from './ServerConfigEditor';
import { Breadcrumb } from './Breadcrumb';
import { useNavigation } from '../hooks/use-navigation';

export function Dashboard() {
  const { currentPage } = useNavigation();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <SectionCards />
          </div>
        );
      case 'server-control':
        return <ServerControlPanel />;
      case 'mod-management':
        return <ModBrowser />;
      case 'collections':
        return <CollectionManager />;
      case 'server-configs':
        return <ServerConfigEditor />;
      default:
        return (
          <div className="space-y-4">
            <SectionCards />
          </div>
        );
    }
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Breadcrumb />
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}
