import { collectionsService } from './collections.service'
import { serverService } from './server.service'
import { modService } from './mods.service'
import { scheduleService } from './schedules.service'

// Export real services only
export const collections = collectionsService
export const server = serverService
export const mods = modService
export const schedules = scheduleService

// Re-export the API service for direct use
export { api } from './api'
