// Auth feature types
export interface AuthUser {
  username: string;
  email?: string;
  avatar?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}