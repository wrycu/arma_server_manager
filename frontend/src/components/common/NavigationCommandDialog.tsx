import * as React from 'react';

import { NavigationCommand } from './NavigationCommand';
import { CommandDialog } from '@/components/ui/command';

export function NavigationCommandDialog() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Navigation Command Palette"
      description="Navigate to different sections of the application"
    >
      <NavigationCommand onNavigate={() => setOpen(false)} />
    </CommandDialog>
  );
}
