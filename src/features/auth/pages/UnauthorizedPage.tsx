import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { getHomeRoute } from '../../../router/utils/getHomeRoute';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const handleBack = () => {
    navigate(user ? getHomeRoute(user.role) : '/login', { replace: true });
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="You don't have permission to access this page."
      extra={<Button type="primary" onClick={handleBack}>Go Back</Button>}
    />
  );
};