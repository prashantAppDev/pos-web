import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { RoleGuard } from './guards/RoleGuard';
import { SuperAdminLayout } from '../layouts/SuperAdminLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { TenantListPage } from '../features/tenants/pages/TenantListPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    // All routes below require a valid session
    element: <AuthGuard />,
    children: [
      {
        // Super admin routes
        element: <RoleGuard allowedRoles={['SUPER_ADMIN']} />,
        children: [
          {
            element: <SuperAdminLayout />,
            children: [
              { path: '/tenants', element: <TenantListPage /> },
            ],
          },
        ],
      },
      // Future: tenant routes for ADMIN/MANAGER/CASHIER
    ],
  },
  {
    path: '/',
    element: <Navigate to="/tenants" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);