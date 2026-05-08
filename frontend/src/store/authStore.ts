import { create } from 'zustand';
import { User } from '@typings/api';
import { apiRequest, setAuthToken } from '@services/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => {
    set({ error });
    if (error) {
      setTimeout(() => set({ error: null }), 5000);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<any>('POST', '/auth/login', {
        email,
        password,
      });

      // Backend returns: { success: true, data: { token, user }, timestamp }
      const { token, user } = response.data || response;
      
      if (!token || !user) {
        throw new Error('Invalid login response from server');
      }

      set({ user, token });
      setAuthToken(token);

      // Persist user so page refreshes don't log the user out
      if (typeof window !== 'undefined') {
        localStorage.setItem('crm_user', JSON.stringify(user));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, token: null });
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm_user');
    }
  },

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('crm_user');
      if (token && userStr && userStr !== 'undefined') {
        try {
          const user: User | null = JSON.parse(userStr);
          set({ token, user });
          setAuthToken(token);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('crm_user');
          localStorage.removeItem('token');
        }
      }
    }
  },
}));
