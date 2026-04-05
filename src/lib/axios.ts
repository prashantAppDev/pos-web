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

// On 401, attempt silent refresh once using HttpOnly cookie, then logout
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      original._retry = true;

      try {
        // No body needed — browser sends the refreshToken HttpOnly cookie automatically
        const { data } = await axiosInstance.post('/auth/refresh');

        useAuthStore.getState().setAuth(data.accessToken, data.user);
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