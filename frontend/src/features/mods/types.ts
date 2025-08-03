// Mods feature types
export interface InstalledMod {
  id: number;
  steamId: number;
  name: string;
  author: string;
  lastUpdated: string;
  type: 'mod' | 'mission' | 'map';
  hasUpdate: boolean;
  sizeOnDisk?: string;
}

export interface UpdatingMod {
  id: number;
  name: string;
  version?: string;
  progress: number;
  status: 'downloading' | 'installing' | 'verifying' | 'completed' | 'error';
  error?: string;
}
