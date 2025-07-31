import axios, { type AxiosResponse } from 'axios';
import type {
  ModHelper,
  ModHelperResponse,
  ModSubscription,
  ModSubscriptionsResponse,
  AddModSubscriptionRequest,
  AddModSubscriptionResponse,
  ModSubscriptionDetailsResponse,
  UpdateModSubscriptionRequest,
  ModDownloadResponse,
  AsyncJobStatusResponse,
  AsyncJobSuccessResponse,
} from '@/types';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions for Arma Server Manager
export const apiService = {
  // Health check
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    const response = await api.get('/health');
    return response.data;
  },

  // Arma3 API endpoints
  arma3: {
    // Get mod overview from Steam API
    getModHelper: async (modId: number): Promise<ModHelper> => {
      const response: AxiosResponse<ModHelperResponse> = await api.get(`/arma3/mod/helper/${modId}`);
      return response.data.results;
    },

    // Get list of existing mod subscriptions
    getModSubscriptions: async (): Promise<ModSubscription[]> => {
      const response: AxiosResponse<ModSubscriptionsResponse> = await api.get('/arma3/mod/subscriptions');
      return response.data.results;
    },

    // Add mod subscription(s)
    addModSubscriptions: async (mods: Array<{ steam_id: number }>): Promise<AddModSubscriptionResponse> => {
      const requestData: AddModSubscriptionRequest = { mods };
      const response: AxiosResponse<AddModSubscriptionResponse> = await api.post('/arma3/mod/subscription', requestData);
      return response.data;
    },

    // Get specific mod subscription details
    getModSubscriptionDetails: async (modId: number): Promise<ModSubscription> => {
      const response: AxiosResponse<ModSubscriptionDetailsResponse> = await api.get(`/arma3/mod/subscription/${modId}`);
      return response.data.results;
    },

    // Update mod subscription details
    updateModSubscription: async (modId: number, updateData: UpdateModSubscriptionRequest): Promise<{ message: string }> => {
      const response: AxiosResponse<{ message: string }> = await api.patch(`/arma3/mod/subscription/${modId}`, updateData);
      return response.data;
    },

    // Remove mod subscription
    removeModSubscription: async (modId: number): Promise<{ message: string }> => {
      const response: AxiosResponse<{ message: string }> = await api.delete(`/arma3/mod/subscription/${modId}`);
      return response.data;
    },

    // Get mod subscription image (returns binary data)
    getModSubscriptionImage: async (modId: number): Promise<Blob> => {
      const response: AxiosResponse<Blob> = await api.get(`/arma3/mod/subscription/${modId}/image`, {
        responseType: 'blob',
      });
      return response.data;
    },

    // Trigger mod download (returns job ID)
    downloadMod: async (modId: number): Promise<ModDownloadResponse> => {
      const response: AxiosResponse<ModDownloadResponse> = await api.post(`/arma3/mod/${modId}/download`);
      return response.data;
    },

    // Trigger mod deletion (returns job ID)
    deleteMod: async (modId: number): Promise<ModDownloadResponse> => {
      const response: AxiosResponse<ModDownloadResponse> = await api.delete(`/arma3/mod/${modId}/download`);
      return response.data;
    },

    // Get async job status
    getAsyncJobStatus: async (jobId: string): Promise<AsyncJobStatusResponse | AsyncJobSuccessResponse> => {
      const response: AxiosResponse<AsyncJobStatusResponse | AsyncJobSuccessResponse> = await api.get(`/arma3/async/${jobId}`);
      return response.data;
    },
  },
};

export default apiService;
