import { AxiosError } from 'axios'
import { toast } from 'sonner'

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: unknown
}

const HTTP_ERROR_MESSAGES = {
  400: 'Bad request - please check your input',
  401: 'Authentication required',
  403: 'Permission denied',
  404: 'Resource not found',
  409: 'Conflict - resource already exists',
  422: 'Validation error - please check your input',
  429: 'Too many requests - please try again later',
  500: 'Server error - please try again later',
  502: 'Service unavailable - please try again later',
  503: 'Service temporarily unavailable',
} as const

const DEFAULT_ERROR_MESSAGE = 'An unknown error occurred'

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Check if the response has a specific error message
    const responseMessage = error.response?.data?.message || error.response?.data?.error
    if (responseMessage) {
      return responseMessage
    }

    // Fallback to generic HTTP error messages
    const status = error.response?.status as keyof typeof HTTP_ERROR_MESSAGES
    return HTTP_ERROR_MESSAGES[status] || error.message || DEFAULT_ERROR_MESSAGE
  }

  if (error instanceof Error) {
    return error.message
  }

  return DEFAULT_ERROR_MESSAGE
}

export const createApiError = (error: unknown): ApiError => {
  const message = extractErrorMessage(error)

  if (error instanceof AxiosError) {
    return {
      message,
      status: error.response?.status,
      code: error.code,
      details: error.response?.data,
    }
  }

  return { message }
}

export const handleApiError = (error: unknown, customMessage?: string): void => {
  const apiError = createApiError(error)
  const message = customMessage || apiError.message

  toast.error(message, {
    richColors: true,
    description: apiError.status ? `Error ${apiError.status}` : undefined,
    duration: 4000,
  })

  // Log error for debugging
  console.error('API Error:', apiError)
}

export const showSuccessToast = (message: string, description?: string): void => {
  toast.success(message, {
    description,
    duration: 3000,
  })
}

export const showInfoToast = (message: string, description?: string): void => {
  toast.info(message, {
    description,
    duration: 4000,
  })
}
