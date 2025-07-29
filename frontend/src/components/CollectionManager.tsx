import { useState } from 'react';
import { IconFolder, IconPlus, IconTrash, IconArrowLeft } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { UpdatingModCard } from './UpdatingModCard';

interface ModItem {
  id: number;
  name: string;
  version?: string;
  size: string;
  type: 'mod' | 'mission' | 'map';
  isServerMod: boolean;
  hasUpdate: boolean;
  disabled: boolean;
}

interface Collection {
  id: number;
  name: string;
  description: string;
  mods: ModItem[];
  createdAt: string;
  isActive: boolean;
}

interface UpdatingMod {
  id: number;
  name: string;
  version?: string;
  progress: number;
  status: 'downloading' | 'installing' | 'verifying' | 'completed' | 'error';
  error?: string;
}

export function CollectionManager() {
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: 1,
      name: 'Combat Enhancement',
      description: 'Essential mods for realistic combat experience',
      mods: [
        {
          id: 1,
          name: '@ACE3',
          version: '3.16.1',
          size: '1.2 GB',
          type: 'mod',
          isServerMod: false,
          hasUpdate: false,
          disabled: false,
        },
        {
          id: 2,
          name: 'CBA_A3',
          version: '3.15.8',
          size: '45 MB',
          type: 'mod',
          isServerMod: false,
          hasUpdate: true,
          disabled: false,
        },
        {
          id: 3,
          name: '@TFAR',
          version: '1.0.328',
          size: '89 MB',
          type: 'mod',
          isServerMod: false,
          hasUpdate: false,
          disabled: true,
        },
      ],
      createdAt: '2024-01-15',
      isActive: true,
    },
    {
      id: 2,
      name: 'Vehicle Pack',
      description: 'Additional vehicles and equipment',
      mods: [
        {
          id: 4,
          name: 'RHS AFRF',
          version: '0.5.6',
          size: '2.8 GB',
          type: 'mod',
          isServerMod: false,
          hasUpdate: false,
          disabled: false,
        },
        {
          id: 5,
          name: 'RHS USAF',
          version: '0.5.6',
          size: '3.1 GB',
          type: 'mod',
          isServerMod: false,
          hasUpdate: false,
          disabled: false,
        },
      ],
      createdAt: '2024-01-10',
      isActive: false,
    },
  ]);

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [modToRemove, setModToRemove] = useState<{
    collectionId: number;
    modId: number;
    modName: string;
  } | null>(null);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const [updatingMods, setUpdatingMods] = useState<UpdatingMod[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  const handleCreateCollection = () => {
    const collection: Collection = {
      id: Date.now(),
      name: newCollection.name,
      description: newCollection.description,
      mods: [],
      createdAt: new Date().toISOString().split('T')[0],
      isActive: false,
    };

    setCollections((prev) => [...prev, collection]);
    setNewCollection({ name: '', description: '' });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteCollection = (id: number) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (selectedCollection?.id === id) {
      setSelectedCollection(null);
    }
  };

  const handleToggleMod = (collectionId: number, modId: number) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              mods: c.mods.map((m) =>
                m.id === modId ? { ...m, disabled: !m.disabled } : m
              ),
            }
          : c
      )
    );

    if (selectedCollection?.id === collectionId) {
      setSelectedCollection((prev) =>
        prev
          ? {
              ...prev,
              mods: prev.mods.map((m) =>
                m.id === modId ? { ...m, disabled: !m.disabled } : m
              ),
            }
          : null
      );
    }
  };

  const handleRemoveModFromCollection = (
    collectionId: number,
    modId: number,
    modName: string
  ) => {
    setModToRemove({ collectionId, modId, modName });
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveMod = () => {
    if (!modToRemove) return;

    setCollections((prev) =>
      prev.map((c) =>
        c.id === modToRemove.collectionId
          ? { ...c, mods: c.mods.filter((m) => m.id !== modToRemove.modId) }
          : c
      )
    );

    if (selectedCollection?.id === modToRemove.collectionId) {
      setSelectedCollection((prev) =>
        prev
          ? {
              ...prev,
              mods: prev.mods.filter((m) => m.id !== modToRemove.modId),
            }
          : null
      );
    }

    setModToRemove(null);
    setIsRemoveDialogOpen(false);
  };

  const handleUpdateMod = async (mod: ModItem) => {
    // Add mod to updating list
    const updatingMod: UpdatingMod = {
      id: mod.id,
      name: mod.name,
      version: mod.version,
      progress: 0,
      status: 'downloading',
    };

    setUpdatingMods((prev) => [...prev, updatingMod]);

    // Simulate update process
    const updateSteps = [
      { status: 'downloading' as const, duration: 2000, progress: 50 },
      { status: 'installing' as const, duration: 1500, progress: 80 },
      { status: 'verifying' as const, duration: 1000, progress: 95 },
      { status: 'completed' as const, duration: 500, progress: 100 },
    ];

    for (const step of updateSteps) {
      await new Promise((resolve) => setTimeout(resolve, step.duration));

      setUpdatingMods((prev) =>
        prev.map((m) =>
          m.id === mod.id ? { ...m, status: step.status, progress: step.progress } : m
        )
      );
    }

    // Update the mod in collections to remove hasUpdate flag
    setCollections((prev) =>
      prev.map((c) => ({
        ...c,
        mods: c.mods.map((m) => (m.id === mod.id ? { ...m, hasUpdate: false } : m)),
      }))
    );

    if (selectedCollection) {
      setSelectedCollection((prev) =>
        prev
          ? {
              ...prev,
              mods: prev.mods.map((m) =>
                m.id === mod.id ? { ...m, hasUpdate: false } : m
              ),
            }
          : null
      );
    }

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setUpdatingMods((prev) => prev.filter((m) => m.id !== mod.id));
    }, 3000);
  };

  const handleCancelUpdate = (modId: number) => {
    setUpdatingMods((prev) => prev.filter((m) => m.id !== modId));
  };

  const handleDismissUpdate = (modId: number) => {
    setUpdatingMods((prev) => prev.filter((m) => m.id !== modId));
  };

  const handleUpdateAllMods = async () => {
    if (!selectedCollection) return;

    const modsWithUpdates = selectedCollection.mods.filter((mod) => mod.hasUpdate);

    for (const mod of modsWithUpdates) {
      await handleUpdateMod(mod);
    }
  };

  const handleSetActive = (collectionId: number) => {
    setCollections((prev) =>
      prev.map((c) => ({
        ...c,
        isActive: c.id === collectionId,
      }))
    );

    if (selectedCollection && selectedCollection.id === collectionId) {
      setSelectedCollection((prev) => (prev ? { ...prev, isActive: true } : null));
    }
  };

  const handleStartEditingTitle = () => {
    if (selectedCollection) {
      setEditingTitle(selectedCollection.name);
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = () => {
    if (!selectedCollection || !editingTitle.trim()) return;

    const trimmedTitle = editingTitle.trim();

    // Update collections
    setCollections((prev) =>
      prev.map((c) =>
        c.id === selectedCollection.id ? { ...c, name: trimmedTitle } : c
      )
    );

    // Update selectedCollection
    setSelectedCollection((prev) => (prev ? { ...prev, name: trimmedTitle } : null));

    setIsEditingTitle(false);
    setEditingTitle('');
  };

  const handleCancelEditingTitle = () => {
    setIsEditingTitle(false);
    setEditingTitle('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditingTitle();
    }
  };

  if (selectedCollection) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCollection(null)}
              className="h-7 w-7 p-0"
            >
              <IconArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <IconFolder className="h-4 w-4 text-muted-foreground" />
              {isEditingTitle ? (
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={handleTitleKeyDown}
                  className="h-6 px-2 py-0 font-medium text-sm border-none shadow-none focus-visible:ring-1 focus-visible:ring-ring bg-transparent"
                  style={{ width: `${Math.max(editingTitle.length * 8 + 20, 120)}px` }}
                  autoFocus
                />
              ) : (
                <span
                  className="font-medium cursor-pointer hover:text-foreground/80 transition-colors px-2 py-1 rounded-sm hover:bg-muted/50"
                  onClick={handleStartEditingTitle}
                  title="Click to edit collection name"
                >
                  {selectedCollection.name}
                </span>
              )}
              {selectedCollection.isActive && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-xs bg-green-500/10 text-green-600 border-green-500/20"
                >
                  Active
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="h-6 px-2 text-xs">
                {selectedCollection.mods.length} mods
              </Badge>
              {selectedCollection.mods.some((m) => m.hasUpdate) && (
                <Badge className="h-6 px-2 text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                  {selectedCollection.mods.filter((m) => m.hasUpdate).length} updates
                </Badge>
              )}
            </div>
            {selectedCollection.mods.some((mod) => mod.hasUpdate) && (
              <Button
                size="sm"
                onClick={handleUpdateAllMods}
                className="h-7 px-3 text-xs"
              >
                Update All
              </Button>
            )}
            {!selectedCollection.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetActive(selectedCollection.id)}
                className="h-7 px-3 text-xs"
              >
                Set Active
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
              <IconPlus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Compact Mods List */}
        <div className="flex-1 overflow-auto p-3">
          {selectedCollection.mods.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <IconFolder className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No mods in this collection
              </p>
              <Button size="sm">
                <IconPlus className="h-3 w-3 mr-1" />
                Add Mods
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {selectedCollection.mods.map((mod) => (
                <div
                  key={mod.id}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md border bg-card hover:bg-muted/30 transition-colors ${
                    mod.disabled ? 'opacity-50' : ''
                  }`}
                >
                  <Checkbox
                    checked={!mod.disabled}
                    onCheckedChange={() =>
                      handleToggleMod(selectedCollection.id, mod.id)
                    }
                    className="h-4 w-4"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium truncate ${mod.disabled ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {mod.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {mod.hasUpdate && (
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        )}
                        {mod.isServerMod && (
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            S
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>v{mod.version}</span>
                      <span>•</span>
                      <span>{mod.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {mod.hasUpdate && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateMod(mod)}
                        className="h-6 px-2 text-xs"
                      >
                        Update
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveModFromCollection(
                          selectedCollection.id,
                          mod.id,
                          mod.name
                        )
                      }
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    >
                      <IconTrash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Updating Mods Cards */}
        {updatingMods.length > 0 && (
          <div className="fixed bottom-4 right-4 space-y-2 z-50">
            {updatingMods.map((mod) => (
              <UpdatingModCard
                key={mod.id}
                mod={mod}
                onCancel={handleCancelUpdate}
                onDismiss={handleDismissUpdate}
              />
            ))}
          </div>
        )}

        {/* Remove Mod Confirmation Dialog */}
        <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Remove Mod</DialogTitle>
              <DialogDescription className="text-sm">
                Remove "{modToRemove?.modName}" from this collection?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRemoveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={confirmRemoveMod}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur">
        <div>
          <h1 className="font-semibold">Collections</h1>
          <p className="text-xs text-muted-foreground">Manage your mod collections</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 px-3 text-xs">
              <IconPlus className="h-3 w-3 mr-1" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Create Collection</DialogTitle>
              <DialogDescription className="text-sm">
                Create a new mod collection to organize your mods.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs">
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
                <Label htmlFor="description" className="text-xs">
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
                onClick={handleCreateCollection}
                disabled={!newCollection.name.trim()}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-auto p-3">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <IconFolder className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No collections yet</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <IconPlus className="h-3 w-3 mr-1" />
                  Create Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base">Create Collection</DialogTitle>
                  <DialogDescription className="text-sm">
                    Create a new mod collection to organize your mods.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-xs">
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
                    <Label htmlFor="description" className="text-xs">
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
                    onClick={handleCreateCollection}
                    disabled={!newCollection.name.trim()}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-1">
            {collections.map((collection) => {
              const updateCount = collection.mods.filter((m) => m.hasUpdate).length;

              return (
                <div
                  key={collection.id}
                  className="group flex items-center gap-3 px-3 py-3 rounded-md border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <IconFolder className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setSelectedCollection(collection)}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm truncate">
                        {collection.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {collection.isActive && (
                          <Badge className="h-4 px-1 text-xs bg-green-500/10 text-green-600 border-green-500/20">
                            Active
                          </Badge>
                        )}
                        <Badge variant="outline" className="h-4 px-1 text-xs">
                          {collection.mods.length} mods
                        </Badge>
                        {updateCount > 0 && (
                          <Badge className="h-4 px-1 text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                            {updateCount} updates
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {collection.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!collection.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(collection.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Set active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.id);
                      }}
                    >
                      <IconTrash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
