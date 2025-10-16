import { BACKEND_BASE_URL } from './api'

export interface AsyncJobStatus {
  status:
    | 'PENDING'
    | 'SUCCESS'
    | 'SUCCEEDED'
    | 'FAILURE'
    | 'FAILED'
    | 'RETRY'
    | 'REVOKED'
    | 'RUNNING'
    | 'ABORTED'
  message: string
}

export interface AsyncJobResponse {
  status: string
  message: string
}

/**
 * Polls an async job status until completion
 * @param jobId - The job ID to poll
 * @param onStatusChange - Callback when status changes
 * @param onComplete - Callback when job completes (success or failure)
 * @param pollInterval - How often to poll in milliseconds (default: 2000)
 * @param maxAttempts - Maximum number of polling attempts (default: 60 = 2 minutes)
 */
export async function pollAsyncJob(
  jobId: string,
  onStatusChange?: (status: AsyncJobStatus) => void,
  onComplete?: (status: AsyncJobStatus) => void,
  pollInterval: number = 2000,
  maxAttempts: number = 60
): Promise<AsyncJobStatus> {
  let attempts = 0

  const poll = async (): Promise<AsyncJobStatus> => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/async/${jobId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch job status: ${response.statusText}`)
      }

      const data: AsyncJobResponse = await response.json()
      const status: AsyncJobStatus = {
        status: data.status as AsyncJobStatus['status'],
        message: data.message,
      }

      // Notify of status change
      onStatusChange?.(status)

      // Check if job is complete (handle both Celery defaults and custom statuses)
      const completedStatuses = ['SUCCESS', 'SUCCEEDED', 'FAILURE', 'FAILED', 'ABORTED']
      if (completedStatuses.includes(status.status)) {
        onComplete?.(status)
        return status
      }

      // Check if we've exceeded max attempts
      attempts++
      if (attempts >= maxAttempts) {
        const timeoutStatus: AsyncJobStatus = {
          status: 'FAILURE',
          message: 'Job polling timed out',
        }
        onComplete?.(timeoutStatus)
        return timeoutStatus
      }

      // Continue polling
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
      return poll()
    } catch (error) {
      const errorStatus: AsyncJobStatus = {
        status: 'FAILURE',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }
      onComplete?.(errorStatus)
      return errorStatus
    }
  }

  return poll()
}

/**
 * Gets the current status of an async job without polling
 * @param jobId - The job ID to check
 */
export async function getAsyncJobStatus(jobId: string): Promise<AsyncJobStatus> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/async/${jobId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch job status: ${response.statusText}`)
    }

    const data: AsyncJobResponse = await response.json()
    return {
      status: data.status as AsyncJobStatus['status'],
      message: data.message,
    }
  } catch (error) {
    return {
      status: 'FAILURE',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
