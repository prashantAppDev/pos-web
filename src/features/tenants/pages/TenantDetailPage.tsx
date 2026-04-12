import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Descriptions, Input, Select, Space, Spin, Table, Tag, Typography,
} from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useTenant } from '../hooks/useTenants';
import { useSuperAdminStoreList } from '../hooks/useSuperAdminStores';
import { TenantFormModal } from '../components/TenantFormModal';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { StoreResponse } from '../../../types/store.types';
import type { TenantResponse } from '../../../types/tenant.types';

const { Title, Text } = Typography;
const { Search } = Input;

export const TenantDetailPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: tenant, isLoading: tenantLoading } = useTenant(tenantId!);
  const { data: stores, isLoading: storesLoading } = useSuperAdminStoreList(tenantId!, {
    page: page - 1,
    size: PAGE_SIZE_DEFAULT,
    search: search || undefined,
    isActive,
  });

  const storeColumns = [
    { title: 'Code', dataIndex: 'storeCode', width: 90 },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (name: string, record: StoreResponse) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => navigate(`/tenants/${tenantId}/stores/${record.id}`)}
        >
          {name}
        </Button>
      ),
    },
    { title: 'Address', dataIndex: 'address', ellipsis: true },
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: 130,
      render: (phone: string | null) => phone ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 100,
      render: (active: boolean) =>
        active
          ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
          : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: StoreResponse) => (
        <Button size="small" onClick={() => navigate(`/tenants/${tenantId}/stores/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  if (tenantLoading) {
    return <div style={styles.center}><Spin size="large" /></div>;
  }

  if (!tenant) return null;

  return (
    <div>
      {/* Header */}
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

      {/* Tenant info */}
      <Descriptions bordered size="small" style={{ marginBottom: 32 }} column={2}>
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

      {/* Stores */}
      <div style={styles.sectionHeader}>
        <Title level={5} style={{ margin: 0 }}>Stores</Title>
      </div>

      <div style={styles.filters}>
        <Space>
          <Search
            placeholder="Search stores"
            allowClear
            onSearch={(v) => { setSearch(v); setPage(1); }}
            onChange={(e) => !e.target.value && setSearch('')}
            style={{ width: 240 }}
          />
          <Select
            defaultValue="all"
            onChange={(v) => { setIsActive(v === 'all' ? undefined : v === 'active'); setPage(1); }}
            style={{ width: 130 }}
            options={[
              { label: 'All Stores', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={storeColumns}
        dataSource={stores?.content}
        loading={storesLoading}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE_DEFAULT,
          total: stores?.totalElements ?? 0,
          onChange: setPage,
          showTotal: (total) => `${total} stores`,
          showSizeChanger: false,
        }}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  filters: {
    marginBottom: 12,
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
};
