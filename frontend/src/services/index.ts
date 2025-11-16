import { collectionsService } from './collections.service'
import { serverService } from './server.service'
import { modService } from './mods.service'
import { scheduleService } from './schedules.service'
import { notificationsService } from './notifications.service'

export const collections = collectionsService
export const server = serverService
export const mods = modService
export const schedules = scheduleService
export const notifications = notificationsService

export { api, healthCheck, getAsyncJobStatus } from './api'
export { pollAsyncJob, getAsyncJobStatus as getJobStatus } from './async.service'
