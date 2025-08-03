import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { NewCollection } from '../types';

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (collection: NewCollection) => void;
  trigger?: React.ReactNode;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  onCreate,
  trigger,
}: CreateCollectionDialogProps) {
  const [newCollection, setNewCollection] = useState<NewCollection>({
    name: '',
    description: '',
  });

  const handleCreate = () => {
    onCreate(newCollection);
    setNewCollection({ name: '', description: '' });
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setNewCollection({ name: '', description: '' });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Create Collection</DialogTitle>
          <DialogDescription className="text-sm">
            Create a new mod collection to organize your mods.
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
              onChange={(e) =>
                setNewCollection((prev) => ({ ...prev, name: e.target.value }))
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
              onChange={(e) =>
                setNewCollection((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Collection description"
              className="min-h-16 text-sm resize-none"
            />
          </div>
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
  );
}
