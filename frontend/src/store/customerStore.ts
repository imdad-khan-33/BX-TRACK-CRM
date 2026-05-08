import { create } from 'zustand';
import { Customer } from '@typings/api';
import { apiRequest } from '@services/api';

interface CustomerStoreState {
  customers: Customer[];
  currentCustomer: Customer | null;
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
  fetchCustomers: (page?: number, pageSize?: number, search?: string) => Promise<void>;
  fetchCustomer: (id: string) => Promise<void>;
  createCustomer: (data: any) => Promise<void>;
  updateCustomer: (id: string, data: any) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  restoreCustomer: (id: string) => Promise<void>;
  assignCustomer: (id: string, userId: string) => Promise<void>;
  unassignCustomer: (id: string) => Promise<void>;
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

export const useCustomerStore = create<CustomerStoreState>((set) => ({
  customers: [],
  currentCustomer: null,
  pagination: defaultPagination,
  isLoading: false,
  error: null,

  fetchCustomers: async (page = 1, pageSize = 10, search = '') => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
      });

      const response = await apiRequest<any>(
        'GET',
        `/customers?${params}`
      );

      set({
        customers: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch customers', isLoading: false });
    }
  },

  fetchCustomer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<any>('GET', `/customers/${id}/with-notes`);
      set({ currentCustomer: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch customer', isLoading: false });
    }
  },

  createCustomer: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<any>('POST', '/customers', data);
      set((state) => ({
        customers: [...(state.customers ?? []), response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create customer', isLoading: false });
      throw error;
    }
  },

  updateCustomer: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<any>('PUT', `/customers/${id}`, data);
      set((state) => ({
        customers: (state.customers ?? []).map((c) => (c.id === id ? response.data : c)),
        currentCustomer: state.currentCustomer?.id === id ? response.data : state.currentCustomer,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update customer', isLoading: false });
      throw error;
    }
  },

  deleteCustomer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest('DELETE', `/customers/${id}`);
      set((state) => ({
        customers: (state.customers ?? []).filter((c) => c.id !== id),
        currentCustomer: state.currentCustomer?.id === id ? null : state.currentCustomer,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete customer', isLoading: false });
      throw error;
    }
  },

  restoreCustomer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<any>('POST', `/customers/${id}/restore`);
      set((state) => ({
        customers: (state.customers ?? []).map((c) => (c.id === id ? response.data : c)),
        currentCustomer: state.currentCustomer?.id === id ? response.data : state.currentCustomer,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to restore customer', isLoading: false });
      throw error;
    }
  },

  assignCustomer: async (id: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<any>('POST', `/customers/${id}/assign`, { userId });
      set((state) => ({
        customers: (state.customers ?? []).map((c) => (c.id === id ? response.data : c)),
        currentCustomer: state.currentCustomer?.id === id ? response.data : state.currentCustomer,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to assign customer', isLoading: false });
      throw error;
    }
  },

  unassignCustomer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<any>('POST', `/customers/${id}/unassign`);
      set((state) => ({
        customers: (state.customers ?? []).map((c) => (c.id === id ? response.data : c)),
        currentCustomer: state.currentCustomer?.id === id ? response.data : state.currentCustomer,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to unassign customer', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      customers: [],
      currentCustomer: null,
      pagination: defaultPagination,
      isLoading: false,
      error: null,
    }),
}));
