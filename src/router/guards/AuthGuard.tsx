import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../../store/auth.store';

// Shows a loading spinner while session is being restored from the refresh cookie.
// Once initialized, redirects to /login if no user is present.
export const AuthGuard = () => {
  const { initialized, user } = useAuthStore();

  if (!initialized) {
    return (
      <div style={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const styles = {
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};