import axios from 'axios'
import { handleApiError } from '@/lib/error-handler'

// Extend axios config to support custom options
declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Skip showing error toast for this request */
    skipErrorToast?: boolean
  }
}

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Export backend base URL (without /api) for direct access to endpoints like images
export const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')
  : 'http://localhost:5000'

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Show error toast for other errors (unless skipErrorToast is set)
    if (!error.config?.skipErrorToast) {
      handleApiError(error)
    }

    return Promise.reject(error)
  }
)

// Health check function
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  const response = await api.get('/health')
  return response.data
}

// Async job status function
export const getAsyncJobStatus = async (
  jobId: string
): Promise<{ status: string; message: string }> => {
  const response = await api.get(`/async/${jobId}`)
  return response.data
}
