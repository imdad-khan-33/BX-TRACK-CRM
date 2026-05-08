import { useCallback } from 'react';
import { useAuthStore } from '@store/authStore';
import { AuthContext } from '@typings/index';

/**
 * Auth hook — thin wrapper around the shared Zustand authStore.
 * All pages and components must use this hook so auth state is
 * always in sync across the app.
 */
export function useAuth(): AuthContext {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const storeLogin = useAuthStore((s) => s.login);
  const storeLogout = useAuthStore((s) => s.logout);

  const login = useCallback(
    async (email: string, password: string) => {
      await storeLogin(email, password);
    },
    [storeLogin]
  );

  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  // Refresh just re-runs login with stored token (already handled by axios interceptor)
  const refreshToken = useCallback(async () => {
    // No-op: token persistence is handled by setAuthToken / localStorage
  }, []);

  return {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
  };
}
