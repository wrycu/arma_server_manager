import type { TaskLogEntry } from '@/types/server'

/**
 * Schedule-related helper functions and constants
 */

/**
 * Schedule action types
 */
export type ScheduleAction = 'server_restart' | 'server_start' | 'server_stop' | 'mod_update'

/**
 * Mapping of schedule action types to human-readable labels
 */
export const actionLabels = {
  server_restart: 'Restart Server',
  server_start: 'Start Server',
  server_stop: 'Stop Server',
  mod_update: 'Update Mods',
} as const satisfies Record<ScheduleAction, string>

/**
 * Gets the appropriate Badge variant for a schedule's enabled status
 * @param enabled - Whether the schedule is enabled
 * @returns Badge variant string
 */
export function getStatusBadgeVariant(enabled: boolean): 'default' | 'outline' {
  return enabled ? 'default' : 'outline'
}

/**
 * Gets the human-readable label for a schedule action
 * @param action - The action type
 * @returns Human-readable action label
 */
export function getActionLabel(action: string): string {
  return actionLabels[action as ScheduleAction] || action
}

/**
 * Gets the human-readable status text for a schedule
 * @param enabled - Whether the schedule is enabled
 * @returns Status text
 */
export function getStatusText(enabled: boolean): string {
  return enabled ? 'Active' : 'Inactive'
}

const outcomeSuccessKeywords = ['success', 'complete', 'completed', 'ok', 'pass']
const outcomeErrorKeywords = ['fail', 'error', 'exception', 'timeout', 'unable']

type OutcomeBadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

/**
 * Determine which badge variant best represents the provided outcome text.
 */
export function getOutcomeBadgeVariant(outcome?: string | null): OutcomeBadgeVariant {
  if (!outcome) {
    return 'outline'
  }

  const normalizedOutcome = outcome.toLowerCase()
  if (outcomeErrorKeywords.some((keyword) => normalizedOutcome.includes(keyword))) {
    return 'destructive'
  }

  if (outcomeSuccessKeywords.some((keyword) => normalizedOutcome.includes(keyword))) {
    return 'default'
  }

  return 'secondary'
}

/**
 * Provides a user-facing label for the schedule result.
 */
export function getOutcomeLabel(outcome?: string | null): string {
  const normalized = outcome?.trim()
  return normalized && normalized.length > 0 ? normalized : 'No result yet'
}

/**
 * Returns the most recent log entry (based on received_at) if available.
 */
export function getLatestLogEntry(logEntries?: TaskLogEntry[]): TaskLogEntry | undefined {
  if (!logEntries?.length) {
    return undefined
  }

  return [...logEntries].sort(
    (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
  )[0]
}
