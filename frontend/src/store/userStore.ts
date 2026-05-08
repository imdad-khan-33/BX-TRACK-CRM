import { create } from 'zustand';
import { User } from '@typings/api';
import { apiRequest } from '@services/api';

interface UserStoreState {
  users: User[];
  currentUser: User | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (page?: number, pageSize?: number) => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  createUser: (data: any) => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const defaultPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useUserStore = create<UserStoreState>((set) => ({
  users: [],
  currentUser: null,
  pagination: defaultPagination,
  isLoading: false,
  error: null,

  fetchUsers: async (page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await apiRequest<any>('GET', `/users?${params}`);

      set({
        users: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch users', isLoading: false });
    }
  },

  fetchUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<any>('GET', `/users/${id}`);
      set({ currentUser: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch user', isLoading: false });
    }
  },

  createUser: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<any>('POST', '/users', data);
      set((state) => ({
        users: [...(state.users ?? []), response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create user', isLoading: false });
      throw error;
    }
  },

  updateUser: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<any>('PUT', `/users/${id}`, data);
      set((state) => ({
        users: (state.users ?? []).map((u) => (u.id === id ? response.data : u)),
        currentUser: state.currentUser?.id === id ? response.data : state.currentUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update user', isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest('DELETE', `/users/${id}`);
      set((state) => ({
        users: (state.users ?? []).filter((u) => u.id !== id),
        currentUser: state.currentUser?.id === id ? null : state.currentUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete user', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      users: [],
      currentUser: null,
      pagination: defaultPagination,
      isLoading: false,
      error: null,
    }),
}));
