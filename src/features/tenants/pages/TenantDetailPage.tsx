import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Descriptions, Drawer, Input, Select, Space, Spin,
  Table, Tabs, Tag, Typography,
} from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useTenant } from '../hooks/useTenants';
import {
  useSuperAdminStoreList, useSuperAdminUserList, useSuperAdminUser,
  useSuperAdminCategoryList, useSuperAdminProductList,
} from '../hooks/useSuperAdminStores';
import { TenantFormModal } from '../components/TenantFormModal';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { StoreResponse } from '../../../types/store.types';
import type { TenantResponse } from '../../../types/tenant.types';
import type { StaffUserResponse } from '../../../types/user.types';
import type { CategoryResponse } from '../../../types/category.types';
import type { ProductResponse } from '../../../types/product.types';

const { Title, Text } = Typography;
const { Search } = Input;

// ── User detail drawer ───────────────────────────────────────
const UserDetailDrawer = ({ tenantId, userId, onClose }: { tenantId: string; userId: string; onClose: () => void }) => {
  const { data: user, isLoading } = useSuperAdminUser(tenantId, userId);
  return (
    <Drawer title="User Details" open onClose={onClose} width={400}>
      {isLoading || !user ? <Spin /> : (
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={user.role === 'MANAGER' ? 'blue' : 'purple'}>
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Store ID">{user.storeId ?? <Text type="secondary">—</Text>}</Descriptions.Item>
          <Descriptions.Item label="Verified">
            {user.isVerified ? <Tag color="success">Verified</Tag> : <Tag color="warning">Pending</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {user.isActive
              ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
              : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag>}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Drawer>
  );
};

// ── Stores tab ───────────────────────────────────────────────
const StoresTab = ({ tenantId }: { tenantId: string }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useSuperAdminStoreList(tenantId, {
    page: page - 1, size: PAGE_SIZE_DEFAULT,
    search: search || undefined, isActive,
  });

  return (
    <>
      <div style={styles.filters}>
        <Space>
          <Search placeholder="Search stores" allowClear
            onSearch={(v) => { setSearch(v); setPage(1); }}
            onChange={(e) => !e.target.value && setSearch('')}
            style={{ width: 240 }} />
          <Select defaultValue="all" style={{ width: 130 }}
            onChange={(v) => { setIsActive(v === 'all' ? undefined : v === 'active'); setPage(1); }}
            options={[{ label: 'All Stores', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
        </Space>
      </div>
      <Table rowKey="id" loading={isLoading} dataSource={data?.content}
        pagination={{ current: page, pageSize: PAGE_SIZE_DEFAULT, total: data?.totalElements ?? 0, onChange: setPage, showTotal: (t) => `${t} stores`, showSizeChanger: false }}
        columns={[
          { title: 'Code', dataIndex: 'storeCode', width: 90 },
          { title: 'Name', dataIndex: 'name', render: (name: string, r: StoreResponse) => (
            <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/tenants/${tenantId}/stores/${r.id}`)}>{name}</Button>
          )},
          { title: 'Address', dataIndex: 'address', ellipsis: true },
          { title: 'Phone', dataIndex: 'phone', width: 130, render: (p: string | null) => p ?? <Text type="secondary">—</Text> },
          { title: 'Status', dataIndex: 'isActive', width: 100, render: (a: boolean) =>
            a ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
              : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag> },
          { title: '', key: 'actions', width: 80, render: (_: unknown, r: StoreResponse) => (
            <Button size="small" onClick={() => navigate(`/tenants/${tenantId}/stores/${r.id}`)}>View</Button>
          )},
        ]}
      />
    </>
  );
};

// ── Staff tab ────────────────────────────────────────────────
const StaffTab = ({ tenantId }: { tenantId: string }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'MANAGER' | 'CASHIER' | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading } = useSuperAdminUserList(tenantId, {
    page: page - 1, size: PAGE_SIZE_DEFAULT,
    search: search || undefined, role, isActive,
  });

  return (
    <>
      <div style={styles.filters}>
        <Space>
          <Search placeholder="Search staff" allowClear
            onSearch={(v) => { setSearch(v); setPage(1); }}
            onChange={(e) => !e.target.value && setSearch('')}
            style={{ width: 240 }} />
          <Select defaultValue="all" style={{ width: 130 }}
            onChange={(v) => { setRole(v === 'all' ? undefined : v as 'MANAGER' | 'CASHIER'); setPage(1); }}
            options={[{ label: 'All Roles', value: 'all' }, { label: 'Manager', value: 'MANAGER' }, { label: 'Cashier', value: 'CASHIER' }]} />
          <Select defaultValue="all" style={{ width: 130 }}
            onChange={(v) => { setIsActive(v === 'all' ? undefined : v === 'active'); setPage(1); }}
            options={[{ label: 'All Status', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
        </Space>
      </div>
      <Table rowKey="id" loading={isLoading} dataSource={data?.content}
        pagination={{ current: page, pageSize: PAGE_SIZE_DEFAULT, total: data?.totalElements ?? 0, onChange: setPage, showTotal: (t) => `${t} staff`, showSizeChanger: false }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Role', dataIndex: 'role', width: 100, render: (r: string) => <Tag color={r === 'MANAGER' ? 'blue' : 'purple'}>{r.charAt(0) + r.slice(1).toLowerCase()}</Tag> },
          { title: 'Store', dataIndex: 'storeId', width: 140, render: (s: string | null) => s ? <Text type="secondary" style={{ fontSize: 11 }}>{s.substring(0, 8)}…</Text> : <Text type="secondary">—</Text> },
          { title: 'Verified', dataIndex: 'isVerified', width: 90, render: (v: boolean) => v ? <Tag color="success">Verified</Tag> : <Tag color="warning">Pending</Tag> },
          { title: 'Status', dataIndex: 'isActive', width: 100, render: (a: boolean) =>
            a ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
              : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag> },
          { title: '', key: 'actions', width: 70, render: (_: unknown, r: StaffUserResponse) => (
            <Button size="small" onClick={() => setSelectedUserId(r.id)}>View</Button>
          )},
        ] satisfies import('antd').TableColumnsType<StaffUserResponse>}
      />
      {selectedUserId && (
        <UserDetailDrawer tenantId={tenantId} userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </>
  );
};

// ── Categories tab ───────────────────────────────────────────
const CategoriesTab = ({ tenantId }: { tenantId: string }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useSuperAdminCategoryList(tenantId, {
    page: page - 1, size: PAGE_SIZE_DEFAULT,
    search: search || undefined, isActive,
  });

  return (
    <>
      <div style={styles.filters}>
        <Space>
          <Search placeholder="Search categories" allowClear
            onSearch={(v) => { setSearch(v); setPage(1); }}
            onChange={(e) => !e.target.value && setSearch('')}
            style={{ width: 240 }} />
          <Select defaultValue="all" style={{ width: 140 }}
            onChange={(v) => { setIsActive(v === 'all' ? undefined : v === 'active'); setPage(1); }}
            options={[{ label: 'All Categories', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
        </Space>
      </div>
      <Table rowKey="id" loading={isLoading} dataSource={data?.content}
        pagination={{ current: page, pageSize: PAGE_SIZE_DEFAULT, total: data?.totalElements ?? 0, onChange: setPage, showTotal: (t) => `${t} categories`, showSizeChanger: false }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Status', dataIndex: 'isActive', width: 100, render: (a: boolean) =>
            a ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
              : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag> },
          { title: 'Created', dataIndex: 'createdAt', width: 140, render: (d: string) => new Date(d).toLocaleDateString('en-IN') },
        ] satisfies import('antd').TableColumnsType<CategoryResponse>}
      />
    </>
  );
};

// ── Products tab ─────────────────────────────────────────────
const ProductsTab = ({ tenantId }: { tenantId: string }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useSuperAdminProductList(tenantId, {
    page: page - 1, size: PAGE_SIZE_DEFAULT,
    search: search || undefined, isActive,
  });

  return (
    <>
      <div style={styles.filters}>
        <Space>
          <Search placeholder="Search products" allowClear
            onSearch={(v) => { setSearch(v); setPage(1); }}
            onChange={(e) => !e.target.value && setSearch('')}
            style={{ width: 280 }} />
          <Select defaultValue="all" style={{ width: 140 }}
            onChange={(v) => { setIsActive(v === 'all' ? undefined : v === 'active'); setPage(1); }}
            options={[{ label: 'All Products', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
        </Space>
      </div>
      <Table rowKey="id" loading={isLoading} dataSource={data?.content}
        pagination={{ current: page, pageSize: PAGE_SIZE_DEFAULT, total: data?.totalElements ?? 0, onChange: setPage, showTotal: (t) => `${t} products`, showSizeChanger: false }}
        columns={[
          { title: 'SKU', dataIndex: 'sku', width: 110 },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Category', dataIndex: 'categoryName', width: 140, render: (n: string | null) => n ?? <Text type="secondary">—</Text> },
          { title: 'GST', dataIndex: 'gstRate', width: 70, render: (r: number) => `${r}%` },
          { title: 'Barcode', dataIndex: 'barcode', width: 150, render: (b: string | null) => b ?? <Text type="secondary">—</Text> },
          { title: 'Status', dataIndex: 'isActive', width: 100, render: (a: boolean) =>
            a ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
              : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag> },
        ] satisfies import('antd').TableColumnsType<ProductResponse>}
      />
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────
export const TenantDetailPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: tenant, isLoading: tenantLoading } = useTenant(tenantId!);

  if (tenantLoading) return <div style={styles.center}><Spin size="large" /></div>;
  if (!tenant) return null;

  return (
    <div>
      <div style={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tenants')} />
          <Title level={4} style={{ margin: 0 }}>{tenant.name}</Title>
          {tenant.isActive
            ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
            : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag>}
        </Space>
        <Button onClick={() => setEditModalOpen(true)}>Edit Tenant</Button>
      </div>

      <Descriptions bordered size="small" style={{ marginBottom: 24 }} column={2}>
        <Descriptions.Item label="Tenant Code">{tenant.tenantCode}</Descriptions.Item>
        <Descriptions.Item label="Plan">
          <Text style={{ textTransform: 'capitalize' }}>{tenant.subscription.toLowerCase()}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Email">{tenant.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{tenant.phone}</Descriptions.Item>
        <Descriptions.Item label="GST Number">{tenant.gstNumber ?? <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Created">{new Date(tenant.createdAt).toLocaleDateString('en-IN')}</Descriptions.Item>
        <Descriptions.Item label="Address" span={2}>{tenant.address}</Descriptions.Item>
      </Descriptions>

      <Tabs
        items={[
          { key: 'stores',     label: 'Stores',     children: <StoresTab tenantId={tenantId!} /> },
          { key: 'staff',      label: 'Staff',      children: <StaffTab tenantId={tenantId!} /> },
          { key: 'categories', label: 'Categories', children: <CategoriesTab tenantId={tenantId!} /> },
          { key: 'products',   label: 'Products',   children: <ProductsTab tenantId={tenantId!} /> },
        ]}
      />

      <TenantFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        tenant={tenant as TenantResponse}
      />
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filters: { marginBottom: 12 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 },
};