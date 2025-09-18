import { useState } from 'react'
import { IconSearch, IconPlus } from '@tabler/icons-react'

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
  const { modSubscriptions } = useMods()
  const [selectedModIds, setSelectedModIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Filter mods that aren't already in the collection
  const filteredMods = modSubscriptions
    .filter((mod) => !existingModIds.includes(mod.id))
    .filter((mod) => (mod.name || '').toLowerCase().includes(searchQuery.toLowerCase()))

  const handleToggleMod = (modId: number) => {
    setSelectedModIds((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    )
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
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">Add Mods to {collectionName}</DialogTitle>
          <DialogDescription className="text-sm">
            Select mods from your subscriptions to add to this collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8 text-sm"
            />
          </div>

          {/* Mods list */}
          <div className="border rounded-md">
            <div className="h-80 overflow-y-auto">
              {filteredMods.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No mods match your search' : 'No available mods to add'}
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
                        <div className="text-xs text-muted-foreground">Steam ID: {mod.steamId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleAddMods} disabled={selectedModIds.length === 0}>
            <IconPlus className="h-3 w-3 mr-1" />
            Add {selectedModIds.length} Mod{selectedModIds.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
