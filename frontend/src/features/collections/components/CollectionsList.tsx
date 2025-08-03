import { IconFolder } from '@tabler/icons-react';

import { CollectionItem } from './CollectionItem';
import type { Collection } from '../types';

interface CollectionsListProps {
  collections: Collection[];
  onSelectCollection: (collection: Collection) => void;
  onDeleteCollection: (collectionId: number) => void;
}

export function CollectionsList({
  collections,
  onSelectCollection,
  onDeleteCollection,
}: CollectionsListProps) {
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <IconFolder className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground mb-3">No collections yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {collections.map((collection) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          onSelectCollection={onSelectCollection}
          onDeleteCollection={onDeleteCollection}
        />
      ))}
    </div>
  );
}
