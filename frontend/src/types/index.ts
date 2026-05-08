export * from './api';

/**
 * Auth context
 */
export interface AuthContext {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'member';
    organizationId: string;
  } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

/**
 * UI State
 */
export interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  clearMessages: () => void;
}
