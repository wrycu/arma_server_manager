import { USE_MOCK_DATA } from '@/lib/mock-data'
import {
  mockCollectionsService,
  mockServerService,
  mockModService,
  mockScheduleService,
} from '@/lib/mock-data'
import { collectionsService } from './collections.service'
import { serverService } from './server.service'
import { modService } from './mods.service'
import { scheduleService } from './schedules.service'

// Per-endpoint mock data control
const USE_MOCK_COLLECTIONS =
  import.meta.env.VITE_USE_MOCK_COLLECTIONS === 'true' ||
  (USE_MOCK_DATA && import.meta.env.VITE_USE_MOCK_COLLECTIONS !== 'false')
const USE_MOCK_SERVER =
  import.meta.env.VITE_USE_MOCK_SERVER === 'true' ||
  (USE_MOCK_DATA && import.meta.env.VITE_USE_MOCK_SERVER !== 'false')
const USE_MOCK_MODS =
  import.meta.env.VITE_USE_MOCK_MODS === 'true' ||
  (USE_MOCK_DATA && import.meta.env.VITE_USE_MOCK_MODS !== 'false')
const USE_MOCK_SCHEDULES =
  import.meta.env.VITE_USE_MOCK_SCHEDULES === 'true' ||
  (USE_MOCK_DATA && import.meta.env.VITE_USE_MOCK_SCHEDULES !== 'false')

// Service factory - exports real or mock services based on per-endpoint environment variables
export const collections = USE_MOCK_COLLECTIONS ? mockCollectionsService : collectionsService
export const server = USE_MOCK_SERVER ? mockServerService : serverService
export const mods = USE_MOCK_MODS ? mockModService : modService
export const schedules = USE_MOCK_SCHEDULES ? mockScheduleService : scheduleService

// Re-export the API service for direct use
export { api } from './api'
