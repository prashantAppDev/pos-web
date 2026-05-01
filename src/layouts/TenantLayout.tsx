import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Dropdown, Layout, Menu, Typography } from 'antd';
import {
  AppstoreOutlined,
  DashboardOutlined,
  HistoryOutlined,
  InboxOutlined,
  LogoutOutlined,
  RollbackOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  TagsOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useLogout } from '../features/auth/hooks/useAuth';
import { useAuthStore } from '../store/auth.store';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const getNavItems = (role: string, storeId?: string | null) => {
  const items = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
  ];

  if (role === 'ADMIN') {
    items.push({
      key: '/stores',
      icon: <ShopOutlined />,
      label: <Link to="/stores">Stores</Link>,
    });
    items.push({
      key: '/categories',
      icon: <TagsOutlined />,
      label: <Link to="/categories">Categories</Link>,
    });
    items.push({
      key: '/products',
      icon: <AppstoreOutlined />,
      label: <Link to="/products">Products</Link>,
    });
  }

  if (role === 'MANAGER' && storeId) {
    items.push({
      key: `/stores/${storeId}`,
      icon: <ShopOutlined />,
      label: <Link to={`/stores/${storeId}`}>My Store</Link>,
    });
    items.push({
      key: `/stores/${storeId}/inventory`,
      icon: <InboxOutlined />,
      label: <Link to={`/stores/${storeId}/inventory`}>Inventory</Link>,
    });
    items.push({
      key: `/stores/${storeId}/pos`,
      icon: <ShoppingCartOutlined />,
      label: <Link to={`/stores/${storeId}/pos`}>POS</Link>,
    });
    items.push({
      key: `/stores/${storeId}/sales`,
      icon: <HistoryOutlined />,
      label: <Link to={`/stores/${storeId}/sales`}>Sales</Link>,
    });
    items.push({
      key: `/stores/${storeId}/returns`,
      icon: <RollbackOutlined />,
      label: <Link to={`/stores/${storeId}/returns`}>Returns</Link>,
    });
  }

  if (role === 'CASHIER' && storeId) {
    items.push({
      key: `/stores/${storeId}/pos`,
      icon: <ShoppingCartOutlined />,
      label: <Link to={`/stores/${storeId}/pos`}>POS</Link>,
    });
    items.push({
      key: `/stores/${storeId}/returns`,
      icon: <RollbackOutlined />,
      label: <Link to={`/stores/${storeId}/returns`}>Returns</Link>,
    });
  }

  return items;
};

export const TenantLayout = () => {
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

  const navItems = getNavItems(user?.role ?? '', user?.storeId);

  // Active key: match /stores/:id as /stores/:id, or /stores as /stores
  const selectedKey = navItems.find((item) =>
    location.pathname === item.key || location.pathname.startsWith(item.key + '/')
  )?.key ?? '';

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
          selectedKeys={[selectedKey]}
          items={navItems}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={styles.header}>
          <Text type="secondary" style={{ fontSize: 13 }}>{user?.role}</Text>
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