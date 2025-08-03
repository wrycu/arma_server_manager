import { useState } from 'react';
import type { Collection, ModItem, UpdatingMod, NewCollection } from '../types';
import { initialCollections } from '../data';

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [updatingMods, setUpdatingMods] = useState<UpdatingMod[]>([]);

  const createCollection = (newCollection: NewCollection) => {
    const collection: Collection = {
      id: Date.now(),
      name: newCollection.name,
      description: newCollection.description,
      mods: [],
      createdAt: new Date().toISOString().split('T')[0],
      isActive: false,
    };

    setCollections((prev) => [...prev, collection]);
    return collection;
  };

  const deleteCollection = (id: number) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (selectedCollection?.id === id) {
      setSelectedCollection(null);
    }
  };

  const toggleMod = (collectionId: number, modId: number) => {
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

  const removeModFromCollection = (collectionId: number, modId: number) => {
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

  const updateMod = async (mod: ModItem) => {
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

  const updateAllMods = async () => {
    if (!selectedCollection) return;

    const modsWithUpdates = selectedCollection.mods.filter((mod) => mod.hasUpdate);

    for (const mod of modsWithUpdates) {
      await updateMod(mod);
    }
  };

  const setActive = (collectionId: number) => {
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

  const updateCollectionName = (collectionId: number, newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    // Update collections
    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, name: trimmedName } : c))
    );

    // Update selectedCollection
    setSelectedCollection((prev) => (prev ? { ...prev, name: trimmedName } : null));
  };

  const cancelUpdate = (modId: number) => {
    setUpdatingMods((prev) => prev.filter((m) => m.id !== modId));
  };

  const dismissUpdate = (modId: number) => {
    setUpdatingMods((prev) => prev.filter((m) => m.id !== modId));
  };

  return {
    collections,
    selectedCollection,
    updatingMods,
    setSelectedCollection,
    createCollection,
    deleteCollection,
    toggleMod,
    removeModFromCollection,
    updateMod,
    updateAllMods,
    setActive,
    updateCollectionName,
    cancelUpdate,
    dismissUpdate,
  };
}
