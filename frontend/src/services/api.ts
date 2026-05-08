import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * API client singleton
 */
let apiClient: AxiosInstance;

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    apiClient.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses
    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  return apiClient;
}

export function setAuthToken(token: string | null): void {
  if (token) {
    getApiClient().defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete getApiClient().defaults.headers.common.Authorization;
    localStorage.removeItem('token');
  }
}

export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = getApiClient();

  try {
    const response = await client({
      method,
      url,
      data,
      ...config,
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error?.message || error.message;
    throw new Error(message);
  }
}
