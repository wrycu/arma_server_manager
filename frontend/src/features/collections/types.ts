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

export interface UpdatingMod {
  id: number;
  name: string;
  version?: string;
  progress: number;
  status: 'downloading' | 'installing' | 'verifying' | 'completed' | 'error';
  error?: string;
}

export interface ModToRemove {
  collectionId: number;
  modId: number;
  modName: string;
}

export interface NewCollection {
  name: string;
  description: string;
}
