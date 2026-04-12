import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { useAuthStore } from '../store/auth.store';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends HttpOnly cookies cross-origin
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Shared refresh promise — ensures only one refresh call is in flight at a time.
// Multiple concurrent 401s all wait for the same promise instead of each rotating the token.
let refreshPromise: Promise<{ accessToken: string; user: unknown }> | null = null;

// On 401, attempt silent refresh once using HttpOnly cookie, then logout
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axiosInstance
            .post('/auth/refresh')
            .then((res) => res.data)
            .finally(() => { refreshPromise = null; });
        }

        const data = await refreshPromise;
        useAuthStore.getState().setAuth(data.accessToken, data.user as any);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(original);
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);