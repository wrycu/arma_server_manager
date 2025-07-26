import { IconChevronRight, IconHome } from '@tabler/icons-react';
import { useNavigation } from '../hooks/use-navigation';

interface BreadcrumbItem {
  label: string;
  page?: string;
}

const pageTitles: Record<string, BreadcrumbItem[]> = {
  dashboard: [{ label: 'Overview' }],
  'server-control': [
    { label: 'Overview', page: 'dashboard' },
    { label: 'Control Panel' },
  ],
  'server-configs': [
    { label: 'Overview', page: 'dashboard' },
    { label: 'Control Panel', page: 'server-control' },
    { label: 'Server Configuration' },
  ],
  'mod-management': [{ label: 'Overview', page: 'dashboard' }, { label: 'Workshop' }],
  collections: [{ label: 'Overview', page: 'dashboard' }, { label: 'Mod Collections' }],
};

export function Breadcrumb() {
  const { currentPage, setCurrentPage } = useNavigation();
  const breadcrumbs = pageTitles[currentPage] || [{ label: 'Overview' }];

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <IconHome className="size-4" />
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <IconChevronRight className="size-4 mx-2" />}
          {item.page ? (
            <button
              onClick={() => setCurrentPage(item.page!)}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
