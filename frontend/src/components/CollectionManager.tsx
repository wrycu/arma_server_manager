import { useState } from 'react';
import {
  IconFolder,
  IconPlus,
  IconTrash,
  IconDownload,
  IconServer,
  IconGripVertical,
  IconX,
} from '@tabler/icons-react';

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

interface ModItem {
  id: number;
  name: string;
  version?: string;
  size: string;
  type: 'mod' | 'mission' | 'map';
  isServerMod: boolean;
  hasUpdate: boolean;
}

interface Collection {
  id: number;
  name: string;
  description: string;
  mods: ModItem[];
  createdAt: string;
  isActive: boolean;
  serverConfigs: string[];
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
        },
        {
          id: 2,
          name: 'CBA_A3',
          version: '3.15.8',
          size: '45 MB',
          type: 'mod',
          isServerMod: false,
          hasUpdate: true,
        },
        {
          id: 3,
          name: '@TFAR',
          version: '1.0.328',
          size: '89 MB',
          type: 'mod',
          isServerMod: false,
          hasUpdate: false,
        },
      ],
      createdAt: '2024-01-15',
      isActive: true,
      serverConfigs: ['Main Server', 'Training Server'],
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
        },
        {
          id: 5,
          name: 'RHS USAF',
          version: '0.5.6',
          size: '3.1 GB',
          type: 'mod',
          isServerMod: false,
          hasUpdate: false,
        },
      ],
      createdAt: '2024-01-10',
      isActive: false,
      serverConfigs: [],
    },
  ]);

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });

  const handleCreateCollection = () => {
    const collection: Collection = {
      id: Date.now(),
      name: newCollection.name,
      description: newCollection.description,
      mods: [],
      createdAt: new Date().toISOString().split('T')[0],
      isActive: false,
      serverConfigs: [],
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

  const handleRemoveModFromCollection = (collectionId: number, modId: number) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId ? { ...c, mods: c.mods.filter((m) => m.id !== modId) } : c
      )
    );

    if (selectedCollection?.id === collectionId) {
      setSelectedCollection((prev) =>
        prev
          ? {
              ...prev,
              mods: prev.mods.filter((m) => m.id !== modId),
            }
          : null
      );
    }
  };

  const getModTypeColor = (type: string) => {
    switch (type) {
      case 'mod':
        return 'bg-blue-500';
      case 'mission':
        return 'bg-green-500';
      case 'map':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Collections Sidebar */}
      <div className="w-80 border-r bg-background flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Collections</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <IconPlus className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                  <DialogDescription>
                    Create a new mod collection to organize your mods.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Collection Name</Label>
                    <Input
                      id="name"
                      value={newCollection.name}
                      onChange={(e) =>
                        setNewCollection((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter collection name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCollection.description}
                      onChange={(e) =>
                        setNewCollection((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter collection description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateCollection}
                    disabled={!newCollection.name.trim()}
                  >
                    Create Collection
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(collection)}
                className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-accent ${
                  selectedCollection?.id === collection.id
                    ? 'bg-accent border border-border'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <IconFolder className="size-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{collection.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {collection.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {collection.isActive && (
                      <div className="size-2 rounded-full bg-green-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.id);
                      }}
                    >
                      <IconTrash className="size-3" />
                    </Button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {selectedCollection ? (
          <>
            {/* Collection Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <IconFolder className="size-6" />
                    <h1 className="text-2xl font-bold">{selectedCollection.name}</h1>
                    {selectedCollection.isActive && (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {selectedCollection.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <IconDownload className="size-4 mr-2" />
                    Update All
                  </Button>
                  <Button variant="outline">
                    <IconServer className="size-4 mr-2" />
                    Deploy
                  </Button>
                </div>
              </div>
            </div>

            {/* Collection Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Mods ({selectedCollection.mods.length})
                    </h3>
                    <Button variant="outline">
                      <IconPlus className="size-4 mr-2" />
                      Add Mod
                    </Button>
                  </div>

                  {selectedCollection.mods.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <IconFolder className="size-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No mods in this collection</p>
                      <p className="text-sm">Add mods to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCollection.mods.map((mod) => (
                        <div
                          key={mod.id}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          <IconGripVertical className="size-4 text-muted-foreground cursor-grab" />

                          <div
                            className={`size-3 rounded-full ${getModTypeColor(mod.type)}`}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{mod.name}</span>
                              {mod.hasUpdate && (
                                <Badge variant="destructive" className="text-xs">
                                  Update Available
                                </Badge>
                              )}
                              {mod.isServerMod && (
                                <Badge variant="secondary" className="text-xs">
                                  Server
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              v{mod.version} • {mod.size}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveModFromCollection(
                                selectedCollection.id,
                                mod.id
                              )
                            }
                          >
                            <IconX className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCollection.serverConfigs.length > 0 && (
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-medium mb-3">Deployed to Servers</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCollection.serverConfigs.map((serverName) => (
                        <Badge key={serverName} variant="outline">
                          <IconServer className="size-3 mr-1" />
                          {serverName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <IconFolder className="size-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a collection to view details</p>
              <p className="text-sm">
                Choose a collection from the sidebar to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
