import { createBrowserRouter } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { RoleGuard } from './guards/RoleGuard';
import { RoleRedirect } from './components/RoleRedirect';
import { SuperAdminLayout } from '../layouts/SuperAdminLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { AcceptInvitePage } from '../features/auth/pages/AcceptInvitePage';
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage';
import { TenantListPage } from '../features/tenants/pages/TenantListPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';

export const router = createBrowserRouter([
  // ── Public ────────────────────────────────────────────────
  { path: '/login',          element: <LoginPage /> },
  { path: '/accept-invite',  element: <AcceptInvitePage /> },
  { path: '/unauthorized',   element: <UnauthorizedPage /> },

  // ── Authenticated ─────────────────────────────────────────
  {
    element: <AuthGuard />,
    children: [
      // Super Admin
      {
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

      // Tenant users (ADMIN / MANAGER / CASHIER)
      {
        element: <RoleGuard allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']} />,
        children: [
          // TODO: wrap in TenantLayout once built
          { path: '/dashboard', element: <DashboardPage /> },
        ],
      },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────
  { path: '/',  element: <RoleRedirect /> },
  { path: '*',  element: <RoleRedirect /> },
]);