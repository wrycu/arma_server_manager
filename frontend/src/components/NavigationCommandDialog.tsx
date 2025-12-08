import { NavigationCommand } from '@/components/NavigationCommand'
import { CommandDialog } from '@/components/ui/command'
import { useCommandPalette } from '@/hooks/useCommandPalette'

export function NavigationCommandDialog() {
  const { open, setOpen } = useCommandPalette()

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Navigate to different sections of the application"
    >
      <NavigationCommand onNavigate={() => setOpen(false)} />
    </CommandDialog>
  )
}
