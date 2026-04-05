import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login, logout, refresh } from '../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';
import type { LoginRequest } from '../../../types/auth.types';

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: (data) => {
      // refreshToken is set as HttpOnly cookie by the backend — we only store the access token
      setAuth(data.accessToken, data.user);
    },
  });
};

export const useLogout = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      // Clear local state regardless of API result
      clearAuth();
    },
  });
};

// Called once on app startup to restore session from HttpOnly refresh cookie
export const useInitializeAuth = () => {
  const { setAuth, clearAuth, setInitialized } = useAuthStore();

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    refresh()
      .then((data) => setAuth(data.accessToken, data.user))
      .catch(() => clearAuth())
      .finally(() => setInitialized());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};