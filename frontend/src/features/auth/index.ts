// Auth feature barrel export
export { LoginPage } from './LoginPage';
export { LoginForm } from './LoginForm';

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
