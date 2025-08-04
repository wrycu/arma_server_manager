import { USE_MOCK_DATA } from '@/lib/mock-data';
import {
  mockCollectionsService,
  mockServerService,
  mockModService,
} from '@/lib/mock-data';
import { collectionsService } from './arma3/collectionsService';
import { serverService } from './arma3/serverService';
import { modService } from './arma3/modService';

// Simple service factory - exports real or mock services based on environment
export const collections = USE_MOCK_DATA ? mockCollectionsService : collectionsService;
export const server = USE_MOCK_DATA ? mockServerService : serverService;
export const mods = USE_MOCK_DATA ? mockModService : modService;

// Re-export the API service for direct use
export { api } from './api';
