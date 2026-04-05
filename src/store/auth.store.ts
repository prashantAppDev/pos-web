import { create } from 'zustand';
import type { UserResponse } from '../types/auth.types';

interface AuthState {
  accessToken: string | null;
  user: UserResponse | null;
  initialized: boolean;
  setAuth: (accessToken: string, user: UserResponse) => void;
  clearAuth: () => void;
  setInitialized: () => void;
}

// Access token lives in memory only — never persisted.
// Refresh token is an HttpOnly cookie managed by the browser.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  initialized: false,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
  setInitialized: () => set({ initialized: true }),
}));