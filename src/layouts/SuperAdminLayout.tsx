import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Dropdown, Layout, Menu, Typography } from 'antd';
import {
  LogoutOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useLogout } from '../features/auth/hooks/useAuth';
import { useAuthStore } from '../store/auth.store';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  {
    key: '/tenants',
    icon: <TeamOutlined />,
    label: <Link to="/tenants">Tenants</Link>,
  },
  {
    key: '/stores',
    icon: <ShopOutlined />,
    label: 'Stores',
    disabled: true,
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
    disabled: true,
  },
];

export const SuperAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout(undefined, { onSettled: () => navigate('/login', { replace: true }) });
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign out',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        style={{ position: 'fixed', height: '100vh', left: 0, zIndex: 100 }}
      >
        <div style={styles.logo}>
          {collapsed ? 'RP' : 'RetailPOS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={NAV_ITEMS}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={styles.header}>
          <Text type="secondary" style={{ fontSize: 13 }}>Super Admin</Text>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={styles.userArea}>
              <Avatar size="small" icon={<UserOutlined />} />
              <Text style={{ marginLeft: 8, cursor: 'pointer' }}>{user?.name}</Text>
            </div>
          </Dropdown>
        </Header>

        <Content style={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

const styles = {
  logo: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: 0.5,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  header: {
    background: '#fff',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f0f0f0',
    position: 'sticky' as const,
    top: 0,
    zIndex: 99,
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
  },
  content: {
    margin: 24,
    padding: 24,
    background: '#fff',
    borderRadius: 8,
    minHeight: 'calc(100vh - 112px)',
  },
};