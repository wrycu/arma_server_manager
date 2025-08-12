import { USE_MOCK_DATA } from '@/lib/mock-data'
import {
  mockCollectionsService,
  mockServerService,
  mockModService,
  mockScheduleService,
} from '@/lib/mock-data'
import { collectionsService } from './collections.service.ts'
import { serverService } from './server.service.ts'
import { modService } from './mods.service.ts'
import { scheduleService } from './schedules.service.ts'

// Simple service factory - exports real or mock services based on environment
export const collections = USE_MOCK_DATA ? mockCollectionsService : collectionsService
export const server = USE_MOCK_DATA ? mockServerService : serverService
export const mods = USE_MOCK_DATA ? mockModService : modService
export const schedules = USE_MOCK_DATA ? mockScheduleService : scheduleService

// Re-export the API service for direct use
export { api } from './api'
