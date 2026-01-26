import { useState, useEffect, useRef } from 'react'
import { IconSearch } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMods } from '@/hooks/useMods'
import { ModsSubscribeDialog } from '@/components/ModsSubscribeDialog'

interface AddModsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMods: (modIds: number[]) => void
  existingModIds: number[]
  collectionName: string
}

export function AddModsDialog({
  open,
  onOpenChange,
  onAddMods,
  existingModIds,
  collectionName,
}: AddModsDialogProps) {
  const { modSubscriptions, addModSubscription, downloadMod } = useMods()
  const [selectedModIds, setSelectedModIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false)
  const pendingSteamIds = useRef<Set<number>>(new Set())

  // Auto-select newly subscribed mods when they appear in the list
  useEffect(() => {
    if (pendingSteamIds.current.size === 0) return

    const newlyAvailableMods = modSubscriptions.filter(
      (mod) => pendingSteamIds.current.has(mod.steamId) && !existingModIds.includes(mod.id)
    )

    if (newlyAvailableMods.length > 0) {
      const newModIds = newlyAvailableMods.map((mod) => mod.id)
      setSelectedModIds((prev) => [...new Set([...prev, ...newModIds])])

      // Remove the found mods from pending
      newlyAvailableMods.forEach((mod) => pendingSteamIds.current.delete(mod.steamId))
    }
  }, [modSubscriptions, existingModIds])

  // Filter mods that aren't already in the collection
  const filteredMods = modSubscriptions
    .filter((mod) => !existingModIds.includes(mod.id))
    .filter((mod) => (mod.name || '').toLowerCase().includes(searchQuery.toLowerCase()))

  const allSelected =
    filteredMods.length > 0 && filteredMods.every((mod) => selectedModIds.includes(mod.id))
  const someSelected = filteredMods.some((mod) => selectedModIds.includes(mod.id))

  const handleToggleMod = (modId: number) => {
    setSelectedModIds((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    )
  }

  const handleToggleAll = () => {
    if (allSelected) {
      // Deselect all filtered mods
      const filteredIds = new Set(filteredMods.map((mod) => mod.id))
      setSelectedModIds((prev) => prev.filter((id) => !filteredIds.has(id)))
    } else {
      // Select all filtered mods
      const allFilteredModIds = filteredMods.map((mod) => mod.id)
      setSelectedModIds((prev) => [...new Set([...prev, ...allFilteredModIds])])
    }
  }

  const handleAddMods = () => {
    onAddMods(selectedModIds)
    setSelectedModIds([])
    setSearchQuery('')
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedModIds([])
      setSearchQuery('')
      pendingSteamIds.current.clear()
    }
    onOpenChange(newOpen)
  }

  const handleSubscribe = async (steamIds: number[], downloadNow: boolean) => {
    // Track these steam IDs so we can auto-select them when they appear
    steamIds.forEach((id) => pendingSteamIds.current.add(id))

    for (const steamId of steamIds) {
      await addModSubscription(steamId)
      if (downloadNow) {
        downloadMod(steamId)
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Add Mods to {collectionName}</DialogTitle>
            <DialogDescription className="text-sm">
              Select mods from your subscriptions to add to this collection.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search input with select all checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={handleToggleAll}
                disabled={filteredMods.length === 0}
                className="h-4 w-4"
                aria-label={allSelected ? 'Deselect all' : 'Select all'}
              />
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-8 text-sm"
                />
              </div>
            </div>

            {/* Mods list */}
            <div className="border rounded-md">
              <div className="h-72 overflow-y-auto">
                {filteredMods.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No mods match your search' : 'No subscribed mods available'}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredMods.map((mod) => (
                      <div
                        key={mod.id}
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={selectedModIds.includes(mod.id)}
                          onCheckedChange={() => handleToggleMod(mod.id)}
                          className="h-4 w-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {mod.name || `Mod ${mod.steamId}`}
                            </span>
                            <div className="flex items-center gap-1">
                              {mod.modType === 'mod' && (
                                <Badge variant="outline" className="h-4 px-1 text-xs">
                                  Mod
                                </Badge>
                              )}
                              {mod.modType === 'mission' && (
                                <Badge variant="outline" className="h-4 px-1 text-xs">
                                  Mission
                                </Badge>
                              )}
                              {mod.modType === 'map' && (
                                <Badge variant="outline" className="h-4 px-1 text-xs">
                                  Map
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Steam ID: {mod.steamId}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsSubscribeDialogOpen(true)}>
              Import
            </Button>
            <Button size="sm" onClick={handleAddMods} disabled={selectedModIds.length === 0}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ModsSubscribeDialog
        open={isSubscribeDialogOpen}
        onOpenChange={setIsSubscribeDialogOpen}
        onSubscribe={handleSubscribe}
      />
    </>
  )
}
