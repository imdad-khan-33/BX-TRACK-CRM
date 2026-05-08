import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStoreState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  sidebarOpen: boolean;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  clearMessages: () => void;
}

export const useUIStore = create<UIStoreState>()(
  persist(
    (set) => ({
      isLoading: false,
      error: null,
      success: null,
      sidebarOpen: true,

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => {
        set({ error, success: null });
        if (error) {
          setTimeout(() => set({ error: null }), 5000);
        }
      },
      setSuccess: (success: string | null) => {
        set({ success, error: null });
        if (success) {
          setTimeout(() => set({ success: null }), 5000);
        }
      },
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      clearMessages: () => set({ error: null, success: null }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

