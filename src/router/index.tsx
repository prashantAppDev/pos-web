import { createBrowserRouter } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { RoleGuard } from './guards/RoleGuard';
import { RoleRedirect } from './components/RoleRedirect';
import { SuperAdminLayout } from '../layouts/SuperAdminLayout';
import { TenantLayout } from '../layouts/TenantLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { AcceptInvitePage } from '../features/auth/pages/AcceptInvitePage';
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage';
import { TenantListPage } from '../features/tenants/pages/TenantListPage';
import { TenantDetailPage } from '../features/tenants/pages/TenantDetailPage';
import { TenantStoreDetailPage } from '../features/tenants/pages/TenantStoreDetailPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { StoreListPage } from '../features/stores/pages/StoreListPage';
import { StoreDetailPage } from '../features/stores/pages/StoreDetailPage';

export const router = createBrowserRouter([
  // ── Public ────────────────────────────────────────────────
  { path: '/login',         element: <LoginPage /> },
  { path: '/accept-invite', element: <AcceptInvitePage /> },
  { path: '/unauthorized',  element: <UnauthorizedPage /> },

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
              { path: '/tenants',                                       element: <TenantListPage /> },
              { path: '/tenants/:tenantId',                             element: <TenantDetailPage /> },
              { path: '/tenants/:tenantId/stores/:storeId',             element: <TenantStoreDetailPage /> },
            ],
          },
        ],
      },

      // Tenant users (ADMIN / MANAGER / CASHIER)
      {
        element: <RoleGuard allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']} />,
        children: [
          {
            element: <TenantLayout />,
            children: [
              { path: '/dashboard',        element: <DashboardPage /> },
              { path: '/stores',           element: <StoreListPage /> },
              { path: '/stores/:storeId',  element: <StoreDetailPage /> },
            ],
          },
        ],
      },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────
  { path: '/',  element: <RoleRedirect /> },
  { path: '*',  element: <RoleRedirect /> },
]);