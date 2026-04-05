import { LockOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Spin, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { acceptInvite, validateInvite } from '../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';
import { getHomeRoute } from '../../../router/utils/getHomeRoute';

const { Title, Text } = Typography;

export const AcceptInvitePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const setAuth = useAuthStore((s) => s.setAuth);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if no token in URL
  if (!token) {
    navigate('/login', { replace: true });
    return null;
  }

  // Validate token on page load before showing form
  const { isLoading: isValidating, isError: isTokenInvalid, error: validationError } = useQuery({
    queryKey: ['validate-invite', token],
    queryFn: () => validateInvite(token),
    retry: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (password: string) => acceptInvite({ token: token!, password }),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      navigate(getHomeRoute(data.user.role), { replace: true });
    },
    onError: (error: unknown) => {
      const message = (error as any)?.response?.data?.message;
      setErrorMessage(message || 'Something went wrong. Please try again.');
    },
  });

  const onFinish = ({ password }: { password: string }) => {
    setErrorMessage(null);
    mutate(password);
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <div style={styles.header}>
          <Title level={3} style={{ margin: 0 }}>RetailPOS</Title>
          <Text type="secondary">Set up your password</Text>
        </div>

        {isValidating ? (
          <div style={styles.center}>
            <Spin size="large" />
            <Text type="secondary" style={{ marginTop: 16 }}>Verifying invite link...</Text>
          </div>
        ) : isTokenInvalid ? (
          <Alert
            message={(validationError as any)?.response?.data?.message || 'Invalid or expired invite link'}
            description="Please contact your administrator for a new invite link."
            type="error"
            showIcon
          />
        ) : (
          <>
            {errorMessage && (
              <Alert
                message={errorMessage}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item
                name="password"
                label="New Password"
                rules={[
                  { required: true, message: 'Password is required' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter new password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm new password"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isPending}
                >
                  Set Password & Sign In
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5',
  },
  card: {
    width: 400,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  center: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '24px 0',
  },
};