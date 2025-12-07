import { IconServer, IconSettings, IconPuzzle, IconFolders } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { useMods } from '@/hooks/useMods'
import { useCollections } from '@/hooks/useCollections'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

const navigationData = {
  arma3: [
    {
      title: 'Control Panel',
      url: '/arma3/control-panel',
      icon: IconServer,
    },
    {
      title: 'Mods',
      url: '/arma3/mods',
      icon: IconPuzzle,
    },
  ],
  other: [
    {
      title: 'Settings',
      url: '/settings',
      icon: IconSettings,
    },
  ],
}

interface NavigationCommandProps {
  className?: string
  onNavigate?: () => void
}

export function NavigationCommand({ className, onNavigate }: NavigationCommandProps) {
  const router = useRouter()
  const { modSubscriptions, isLoading: isLoadingMods } = useMods()
  const { collections, isLoading: isLoadingCollections } = useCollections()

  const handleItemSelect = (item: { action?: string; url: string }) => {
    router.navigate({ to: item.url })
    onNavigate?.()
  }

  const handleModSelect = (modId: number) => {
    // Navigate to mods page with the mod ID as a search parameter
    router.navigate({
      to: '/arma3/mods',
      search: { tab: 'subscriptions', modId },
    })
    onNavigate?.()
  }

  const handleCollectionSelect = (collectionId: number) => {
    router.navigate({
      to: '/arma3/mods/$collectionId',
      params: { collectionId: String(collectionId) },
    })
    onNavigate?.()
  }

  return (
    <Command className={className}>
      <CommandInput placeholder="Search pages, mods, and collections..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {navigationData.arma3.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.url}
                onSelect={() => handleItemSelect(item)}
                className="flex cursor-pointer items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            )
          })}
          {navigationData.other.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.url}
                onSelect={() => handleItemSelect(item)}
                className="flex cursor-pointer items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        {!isLoadingCollections && collections.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Collections">
              {collections.map((collection) => (
                <CommandItem
                  key={`collection-${collection.id}`}
                  onSelect={() => handleCollectionSelect(collection.id)}
                  className="flex cursor-pointer items-center gap-2"
                  keywords={[collection.name, collection.description]}
                >
                  <IconFolders className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{collection.name}</span>
                    {collection.description && (
                      <span className="text-xs text-muted-foreground">
                        {collection.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!isLoadingMods && modSubscriptions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Mods">
              {modSubscriptions.map((mod) => (
                <CommandItem
                  key={`mod-${mod.id}`}
                  onSelect={() => handleModSelect(mod.id)}
                  className="flex cursor-pointer items-center gap-2"
                  keywords={[mod.name, String(mod.steamId)]}
                >
                  <IconPuzzle className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{mod.name}</span>
                    <span className="text-xs text-muted-foreground">Steam ID: {mod.steamId}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  )
}
