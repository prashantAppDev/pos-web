import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useInitializeAuth } from './features/auth/hooks/useAuth';

// Attempts to restore session from HttpOnly refresh cookie on every app load
const AuthInitializer = () => {
  useInitializeAuth();
  return null;
};

const App = () => (
  <>
    <AuthInitializer />
    <RouterProvider router={router} />
  </>
);

export default App;