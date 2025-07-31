// Server feature barrel export
export { ServerControlPanel } from './ServerControlPanel';
export { ServerConfigEditor } from './ServerConfigEditor';

// Server feature types
export interface ServerStatus {
  name: string;
  status: 'online' | 'offline' | 'starting' | 'stopping';
  uptime?: number;
  players: number;
  maxPlayers: number;
  mission?: string;
  lastRestart?: string;
  cpu: number;
  memory: number;
  mods: number;
  version: string;
}
