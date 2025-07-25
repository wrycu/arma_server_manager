import axios, { type AxiosResponse } from 'axios';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Types for Arma Server Manager

export interface Mod {
  id: number;
  steam_id?: number;
  filename: string;
  name: string;
  version?: string;
  mod_type: 'mod' | 'mission' | 'map';
  local_path?: string;
  arguments?: string;
  server_mod: boolean;
  size_bytes?: number;
  last_updated?: string;
  steam_last_updated?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateModRequest {
  steam_id?: number;
  filename: string;
  name: string;
  version?: string;
  mod_type?: 'mod' | 'mission' | 'map';
  local_path?: string;
  arguments?: string;
  server_mod?: boolean;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  mod_count: number;
  created_at: string;
  updated_at: string;
  mods?: ModCollectionEntry[];
}

export interface ModCollectionEntry {
  id: number;
  collection_id: number;
  mod_id: number;
  arguments?: string;
  added_at: string;
  mod?: Mod;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export interface ServerConfig {
  id: number;
  name: string;
  description?: string;
  server_name: string;
  password?: string;
  admin_password?: string;
  max_players: number;
  mission_file?: string;
  server_config_file?: string;
  basic_config_file?: string;
  server_mods?: string;
  client_mods?: string;
  additional_params?: string;
  auto_restart: boolean;
  restart_interval_hours?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServerConfigRequest {
  name: string;
  description?: string;
  server_name: string;
  password?: string;
  admin_password: string;
  max_players?: number;
  mission_file?: string;
  server_config_file?: string;
  basic_config_file?: string;
  server_mods?: string;
  client_mods?: string;
  additional_params?: string;
  auto_restart?: boolean;
  restart_interval_hours?: number;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ModsResponse {
  mods: Mod[];
  pagination: PaginationInfo;
}

export interface CollectionsResponse {
  collections: Collection[];
  pagination: PaginationInfo;
}

export interface ServerConfigsResponse {
  server_configs: ServerConfig[];
  pagination: PaginationInfo;
}

// API service functions for Arma Server Manager
export const apiService = {
  // Health check
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    const response = await api.get('/health');
    return response.data;
  },

  // Mod management
  getMods: async (page = 1, per_page = 10): Promise<ModsResponse> => {
    const response: AxiosResponse<ModsResponse> = await api.get('/mods', {
      params: { page, per_page },
    });
    return response.data;
  },

  getModById: async (id: number): Promise<Mod> => {
    const response: AxiosResponse<{ mod: Mod }> = await api.get(`/mods/${id}`);
    return response.data.mod;
  },

  createMod: async (modData: CreateModRequest): Promise<Mod> => {
    const response: AxiosResponse<{ mod: Mod }> = await api.post('/mods', modData);
    return response.data.mod;
  },

  updateMod: async (id: number, modData: Partial<CreateModRequest>): Promise<Mod> => {
    const response: AxiosResponse<{ mod: Mod }> = await api.put(`/mods/${id}`, modData);
    return response.data.mod;
  },

  deleteMod: async (id: number): Promise<void> => {
    await api.delete(`/mods/${id}`);
  },

  downloadMod: async (steamId: number): Promise<Mod> => {
    const response: AxiosResponse<{ mod: Mod }> = await api.post('/mods/download', {
      steam_id: steamId,
    });
    return response.data.mod;
  },

  updateModFromSteam: async (id: number): Promise<Mod> => {
    const response: AxiosResponse<{ mod: Mod }> = await api.post(`/mods/${id}/update`);
    return response.data.mod;
  },

  // Collection management
  getCollections: async (page = 1, per_page = 10): Promise<CollectionsResponse> => {
    const response: AxiosResponse<CollectionsResponse> = await api.get('/collections', {
      params: { page, per_page },
    });
    return response.data;
  },

  getCollectionById: async (id: number, include_mods = false): Promise<Collection> => {
    const response: AxiosResponse<{ collection: Collection }> = await api.get(
      `/collections/${id}`,
      {
        params: { include_mods },
      }
    );
    return response.data.collection;
  },

  createCollection: async (
    collectionData: CreateCollectionRequest
  ): Promise<Collection> => {
    const response: AxiosResponse<{ collection: Collection }> = await api.post(
      '/collections',
      collectionData
    );
    return response.data.collection;
  },

  updateCollection: async (
    id: number,
    collectionData: Partial<CreateCollectionRequest>
  ): Promise<Collection> => {
    const response: AxiosResponse<{ collection: Collection }> = await api.put(
      `/collections/${id}`,
      collectionData
    );
    return response.data.collection;
  },

  deleteCollection: async (id: number): Promise<void> => {
    await api.delete(`/collections/${id}`);
  },

  addModToCollection: async (
    collectionId: number,
    modId: number,
    args?: string
  ): Promise<ModCollectionEntry> => {
    const response: AxiosResponse<{ entry: ModCollectionEntry }> = await api.post(
      `/collections/${collectionId}/mods`,
      {
        mod_id: modId,
        arguments: args,
      }
    );
    return response.data.entry;
  },

  removeModFromCollection: async (
    collectionId: number,
    modId: number
  ): Promise<void> => {
    await api.delete(`/collections/${collectionId}/mods/${modId}`);
  },

  // Server configuration management
  getServerConfigs: async (page = 1, per_page = 10): Promise<ServerConfigsResponse> => {
    const response: AxiosResponse<ServerConfigsResponse> = await api.get(
      '/server-configs',
      {
        params: { page, per_page },
      }
    );
    return response.data;
  },

  getServerConfigById: async (
    id: number,
    include_sensitive = false
  ): Promise<ServerConfig> => {
    const response: AxiosResponse<{ config: ServerConfig }> = await api.get(
      `/server-configs/${id}`,
      {
        params: { include_sensitive },
      }
    );
    return response.data.config;
  },

  createServerConfig: async (
    configData: CreateServerConfigRequest
  ): Promise<ServerConfig> => {
    const response: AxiosResponse<{ config: ServerConfig }> = await api.post(
      '/server-configs',
      configData
    );
    return response.data.config;
  },

  updateServerConfig: async (
    id: number,
    configData: Partial<CreateServerConfigRequest>
  ): Promise<ServerConfig> => {
    const response: AxiosResponse<{ config: ServerConfig }> = await api.put(
      `/server-configs/${id}`,
      configData
    );
    return response.data.config;
  },

  deleteServerConfig: async (id: number): Promise<void> => {
    await api.delete(`/server-configs/${id}`);
  },

  startServer: async (
    configId: number
  ): Promise<{ status: string; message: string }> => {
    const response = await api.post(`/server-configs/${configId}/start`);
    return response.data;
  },

  stopServer: async (
    configId: number
  ): Promise<{ status: string; message: string }> => {
    const response = await api.post(`/server-configs/${configId}/stop`);
    return response.data;
  },

  getServerStatus: async (
    configId: number
  ): Promise<{ status: string; uptime?: number; players?: number }> => {
    const response = await api.get(`/server-configs/${configId}/status`);
    return response.data;
  },
};

export default apiService;
