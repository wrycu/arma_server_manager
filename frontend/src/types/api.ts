// API types for Arma Server Manager
// Contains only types for endpoints that actually exist in the backend

// Arma3 API specific types

export interface ModHelper {
  description: string;
  file_size: string;
  preview_url: string;
  tags: string[];
  time_updated: string;
  title: string;
}

export interface ModHelperResponse {
  results: ModHelper;
  message: string;
}

export interface ModSubscription {
  steam_id: number;
  // Add other subscription properties based on actual backend model
  name?: string;
  status?: string;
  last_updated?: string;
}

export interface ModSubscriptionsResponse {
  results: ModSubscription[];
  message: string;
}

export interface AddModSubscriptionRequest {
  mods: Array<{
    steam_id: number;
  }>;
}

export interface AddModSubscriptionResponse {
  message: string;
  ids: number[];
}

export interface ModSubscriptionDetailsResponse {
  results: ModSubscription;
  message: string;
}

export interface UpdateModSubscriptionRequest {
  // Define based on what fields can be updated
  name?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ModDownloadResponse {
  status: string; // job_id
  message: string;
}

export interface AsyncJobStatusResponse {
  status: string;
  message: string;
}

export interface AsyncJobSuccessResponse {
  // The result structure when job is successful
  [key: string]: string | number | boolean | object | undefined;
}