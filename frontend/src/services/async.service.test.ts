/// <reference types="vitest/globals" />
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { pollAsyncJob, getAsyncJobStatus } from '@/services/async.service'

// Mock fetch globally
global.fetch = vi.fn()

describe('getAsyncJobStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches job status successfully', async () => {
    const mockResponse = {
      status: 'SUCCESS',
      message: 'Job completed',
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await getAsyncJobStatus('job-123')

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/async/job-123'))
    expect(result).toEqual({
      status: 'SUCCESS',
      message: 'Job completed',
    })
  })

  it('handles fetch error gracefully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as Response)

    const result = await getAsyncJobStatus('job-999')

    expect(result).toEqual({
      status: 'FAILURE',
      message: 'Failed to fetch job status: Not Found',
    })
  })

  it('handles network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const result = await getAsyncJobStatus('job-123')

    expect(result).toEqual({
      status: 'FAILURE',
      message: 'Network error',
    })
  })
})

describe('pollAsyncJob', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('polls until job completes successfully', async () => {
    const responses = [
      { status: 'PENDING', message: 'Job queued' },
      { status: 'RUNNING', message: 'Processing...' },
      { status: 'SUCCESS', message: 'Job completed' },
    ]

    let callCount = 0
    vi.mocked(fetch).mockImplementation(async () => {
      const response = responses[callCount++]
      return {
        ok: true,
        json: async () => response,
      } as Response
    })

    const onStatusChange = vi.fn()
    const onComplete = vi.fn()

    const pollPromise = pollAsyncJob('job-123', onStatusChange, onComplete, 100, 10)

    // First call - PENDING
    await vi.advanceTimersByTimeAsync(0)
    expect(onStatusChange).toHaveBeenCalledWith({
      status: 'PENDING',
      message: 'Job queued',
    })

    // Wait for poll interval
    await vi.advanceTimersByTimeAsync(100)

    // Second call - RUNNING
    await vi.advanceTimersByTimeAsync(0)
    expect(onStatusChange).toHaveBeenCalledWith({
      status: 'RUNNING',
      message: 'Processing...',
    })

    // Wait for poll interval
    await vi.advanceTimersByTimeAsync(100)

    // Third call - SUCCESS
    await vi.advanceTimersByTimeAsync(0)

    const result = await pollPromise

    expect(onStatusChange).toHaveBeenCalledTimes(3)
    expect(onStatusChange).toHaveBeenLastCalledWith({
      status: 'SUCCESS',
      message: 'Job completed',
    })
    expect(onComplete).toHaveBeenCalledWith({
      status: 'SUCCESS',
      message: 'Job completed',
    })
    expect(result).toEqual({
      status: 'SUCCESS',
      message: 'Job completed',
    })
  })

  it('stops polling on FAILURE status', async () => {
    const responses = [
      { status: 'PENDING', message: 'Job queued' },
      { status: 'FAILURE', message: 'Job failed' },
    ]

    let callCount = 0
    vi.mocked(fetch).mockImplementation(async () => {
      const response = responses[callCount++]
      return {
        ok: true,
        json: async () => response,
      } as Response
    })

    const onStatusChange = vi.fn()
    const onComplete = vi.fn()

    const pollPromise = pollAsyncJob('job-123', onStatusChange, onComplete, 100, 10)

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(0)

    const result = await pollPromise

    expect(onComplete).toHaveBeenCalledWith({
      status: 'FAILURE',
      message: 'Job failed',
    })
    expect(result.status).toBe('FAILURE')
    expect(callCount).toBe(2) // Should stop after FAILURE
  })

  it('stops polling on SUCCEEDED status', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'SUCCEEDED', message: 'Completed' }),
    } as Response)

    const onComplete = vi.fn()

    const pollPromise = pollAsyncJob('job-123', undefined, onComplete, 100, 10)

    await vi.advanceTimersByTimeAsync(0)

    const result = await pollPromise

    expect(onComplete).toHaveBeenCalledWith({
      status: 'SUCCEEDED',
      message: 'Completed',
    })
    expect(result.status).toBe('SUCCEEDED')
  })

  it('stops polling on ABORTED status', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ABORTED', message: 'Job aborted' }),
    } as Response)

    const onComplete = vi.fn()

    const pollPromise = pollAsyncJob('job-123', undefined, onComplete, 100, 10)

    await vi.advanceTimersByTimeAsync(0)

    const result = await pollPromise

    expect(onComplete).toHaveBeenCalledWith({
      status: 'ABORTED',
      message: 'Job aborted',
    })
    expect(result.status).toBe('ABORTED')
  })

  it('times out after max attempts', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'RUNNING', message: 'Still running...' }),
    } as Response)

    const onStatusChange = vi.fn()
    const onComplete = vi.fn()

    const pollPromise = pollAsyncJob('job-123', onStatusChange, onComplete, 100, 3)

    // Poll 3 times
    for (let i = 0; i < 3; i++) {
      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(100)
    }

    // Fourth attempt triggers timeout
    await vi.advanceTimersByTimeAsync(0)

    const result = await pollPromise

    expect(onComplete).toHaveBeenCalledWith({
      status: 'FAILURE',
      message: 'Job polling timed out',
    })
    expect(result).toEqual({
      status: 'FAILURE',
      message: 'Job polling timed out',
    })
  })

  it('handles network error during polling', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'))

    const onComplete = vi.fn()

    const pollPromise = pollAsyncJob('job-123', undefined, onComplete, 100, 10)

    await vi.advanceTimersByTimeAsync(0)

    const result = await pollPromise

    expect(onComplete).toHaveBeenCalledWith({
      status: 'FAILURE',
      message: 'Network failure',
    })
    expect(result).toEqual({
      status: 'FAILURE',
      message: 'Network failure',
    })
  })

  it('handles HTTP error during polling', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    } as Response)

    const onComplete = vi.fn()

    const pollPromise = pollAsyncJob('job-123', undefined, onComplete, 100, 10)

    await vi.advanceTimersByTimeAsync(0)

    const result = await pollPromise

    expect(onComplete).toHaveBeenCalledWith({
      status: 'FAILURE',
      message: 'Failed to fetch job status: Internal Server Error',
    })
    expect(result.status).toBe('FAILURE')
  })

  it('calls onStatusChange for each poll', async () => {
    const responses = [
      { status: 'PENDING', message: 'Queued' },
      { status: 'RUNNING', message: 'Processing' },
      { status: 'RUNNING', message: 'Still processing' },
      { status: 'SUCCESS', message: 'Done' },
    ]

    let callCount = 0
    vi.mocked(fetch).mockImplementation(async () => {
      const response = responses[callCount++]
      return {
        ok: true,
        json: async () => response,
      } as Response
    })

    const onStatusChange = vi.fn()
    const onComplete = vi.fn()

    const pollPromise = pollAsyncJob('job-123', onStatusChange, onComplete, 100, 10)

    for (let i = 0; i < 4; i++) {
      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(100)
    }

    await pollPromise

    expect(onStatusChange).toHaveBeenCalledTimes(4)
    expect(onStatusChange).toHaveBeenNthCalledWith(1, {
      status: 'PENDING',
      message: 'Queued',
    })
    expect(onStatusChange).toHaveBeenNthCalledWith(2, {
      status: 'RUNNING',
      message: 'Processing',
    })
    expect(onStatusChange).toHaveBeenNthCalledWith(3, {
      status: 'RUNNING',
      message: 'Still processing',
    })
    expect(onStatusChange).toHaveBeenNthCalledWith(4, {
      status: 'SUCCESS',
      message: 'Done',
    })
  })

  it('works without callbacks', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'SUCCESS', message: 'Complete' }),
    } as Response)

    const pollPromise = pollAsyncJob('job-123')

    await vi.advanceTimersByTimeAsync(0)

    const result = await pollPromise

    expect(result).toEqual({
      status: 'SUCCESS',
      message: 'Complete',
    })
  })

  it('uses custom poll interval', async () => {
    const responses = [
      { status: 'RUNNING', message: 'Processing' },
      { status: 'SUCCESS', message: 'Done' },
    ]

    let callCount = 0
    vi.mocked(fetch).mockImplementation(async () => {
      const response = responses[callCount++]
      return {
        ok: true,
        json: async () => response,
      } as Response
    })

    const pollPromise = pollAsyncJob('job-123', undefined, undefined, 500, 10)

    await vi.advanceTimersByTimeAsync(0)
    expect(callCount).toBe(1)

    // Advance by custom interval (500ms)
    await vi.advanceTimersByTimeAsync(500)
    await vi.advanceTimersByTimeAsync(0)

    await pollPromise

    expect(callCount).toBe(2)
  })

  it('handles FAILED status (alternative to FAILURE)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'FAILED', message: 'Task failed' }),
    } as Response)

    const onComplete = vi.fn()

    const pollPromise = pollAsyncJob('job-123', undefined, onComplete, 100, 10)

    await vi.advanceTimersByTimeAsync(0)

    const result = await pollPromise

    expect(onComplete).toHaveBeenCalledWith({
      status: 'FAILED',
      message: 'Task failed',
    })
    expect(result.status).toBe('FAILED')
  })

  it('continues polling on RETRY status', async () => {
    const responses = [
      { status: 'RETRY', message: 'Retrying...' },
      { status: 'RUNNING', message: 'Processing' },
      { status: 'SUCCESS', message: 'Done' },
    ]

    let callCount = 0
    vi.mocked(fetch).mockImplementation(async () => {
      const response = responses[callCount++]
      return {
        ok: true,
        json: async () => response,
      } as Response
    })

    const onStatusChange = vi.fn()

    const pollPromise = pollAsyncJob('job-123', onStatusChange, undefined, 100, 10)

    for (let i = 0; i < 3; i++) {
      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(100)
    }

    await pollPromise

    expect(onStatusChange).toHaveBeenCalledTimes(3)
    // Should continue polling through RETRY status
    expect(callCount).toBe(3)
  })
})
