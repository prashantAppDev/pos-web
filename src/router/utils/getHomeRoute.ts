import type { UserRole } from '../../types/auth.types';

export const getHomeRoute = (role: UserRole): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/tenants';
    case 'ADMIN':
    case 'MANAGER':
    case 'CASHIER':
      return '/dashboard';
  }
};