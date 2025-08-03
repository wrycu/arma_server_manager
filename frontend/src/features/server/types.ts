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

export interface ServerMetrics {
  timestamp: number;
  players: number;
  cpu: number;
  memory: number;
}

export type ServerAction = 'start' | 'stop' | 'restart';
