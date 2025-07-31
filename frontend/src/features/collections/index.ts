// Collections feature barrel export
export { CollectionManager } from './CollectionManager';

// Collections feature types
export interface ModItem {
  id: number;
  name: string;
  version?: string;
  size: string;
  type: 'mod' | 'mission' | 'map';
  isServerMod: boolean;
  hasUpdate: boolean;
  disabled: boolean;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  mods: ModItem[];
  createdAt: string;
  isActive: boolean;
}
