import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { NewCollection, ModItem } from '../types'

interface CreateCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (collection: NewCollection) => void
  trigger?: React.ReactNode
  selectedMods?: ModItem[]
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  onCreate,
  trigger,
  selectedMods = [],
}: CreateCollectionDialogProps) {
  const [newCollection, setNewCollection] = useState<NewCollection>({
    name: '',
    description: '',
  })

  const handleCreate = () => {
    onCreate({
      ...newCollection,
      mods: selectedMods.length > 0 ? selectedMods : undefined,
    })
    setNewCollection({ name: '', description: '' })
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setNewCollection({ name: '', description: '' })
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Create Collection</DialogTitle>
          <DialogDescription className="text-sm">
            {selectedMods.length > 0
              ? `Create a new collection with ${selectedMods.length} selected mod${selectedMods.length === 1 ? '' : 's'}.`
              : 'Create a new mod collection to organize your mods.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-xs py-1">
              Name
            </Label>
            <Input
              id="name"
              value={newCollection.name}
              onChange={e =>
                setNewCollection(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Collection name"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-xs py-1">
              Description
            </Label>
            <Textarea
              id="description"
              value={newCollection.description}
              onChange={e =>
                setNewCollection(prev => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Collection description"
              className="min-h-16 text-sm resize-none"
            />
          </div>
          {selectedMods.length > 0 && (
            <div>
              <Label className="text-xs py-1">Selected Mods</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/50">
                <div className="flex flex-wrap gap-1">
                  {selectedMods.map(mod => (
                    <Badge key={mod.id} variant="secondary" className="text-xs">
                      {mod.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newCollection.name.trim()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
