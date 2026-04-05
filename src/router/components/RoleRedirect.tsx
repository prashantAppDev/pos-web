import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { getHomeRoute } from '../utils/getHomeRoute';

// Used at / — redirects to the correct home based on the user's role,
// or to /login if not authenticated.
export const RoleRedirect = () => {
  const user = useAuthStore((s) => s.user);
  return <Navigate to={user ? getHomeRoute(user.role) : '/login'} replace />;
};