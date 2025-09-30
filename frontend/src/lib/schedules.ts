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
