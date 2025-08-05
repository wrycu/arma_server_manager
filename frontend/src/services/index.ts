import { USE_MOCK_DATA } from '@/lib/mock-data';
import {
  mockCollectionsService,
  mockServerService,
  mockModService,
  mockScheduleService,
} from '@/lib/mock-data';
import { collectionsService } from './arma3/collectionsService';
import { serverService } from './arma3/serverService';
import { modService } from './arma3/modService';
import { scheduleService } from './arma3/scheduleService';

// Simple service factory - exports real or mock services based on environment
export const collections = USE_MOCK_DATA ? mockCollectionsService : collectionsService;
export const server = USE_MOCK_DATA ? mockServerService : serverService;
export const mods = USE_MOCK_DATA ? mockModService : modService;
export const schedules = USE_MOCK_DATA ? mockScheduleService : scheduleService;

// Re-export the API service for direct use
export { api } from './api';
