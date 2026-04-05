import { useState } from 'react';
import { Button, Input, Select, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTenantList } from '../hooks/useTenants';
import { TenantTable } from '../components/TenantTable';
import { TenantFormModal } from '../components/TenantFormModal';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { TenantResponse } from '../../../types/tenant.types';

const { Title } = Typography;
const { Search } = Input;

export const TenantListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantResponse | undefined>();

  const { data, isLoading } = useTenantList({
    page: page - 1, // backend is 0-indexed
    size: PAGE_SIZE_DEFAULT,
    search: search || undefined,
    isActive,
  });

  const openCreate = () => {
    setEditingTenant(undefined);
    setModalOpen(true);
  };

  const openEdit = (tenant: TenantResponse) => {
    setEditingTenant(tenant);
    setModalOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setIsActive(value === 'all' ? undefined : value === 'active');
    setPage(1);
  };

  return (
    <div>
      <div style={styles.header}>
        <Title level={4} style={{ margin: 0 }}>Tenants</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          New Tenant
        </Button>
      </div>

      <div style={styles.filters}>
        <Space>
          <Search
            placeholder="Search by name or email"
            allowClear
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch('')}
            style={{ width: 280 }}
          />
          <Select
            defaultValue="all"
            onChange={handleStatusFilter}
            style={{ width: 140 }}
            options={[
              { label: 'All Tenants', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </Space>
      </div>

      <TenantTable
        data={data}
        loading={isLoading}
        page={page}
        pageSize={PAGE_SIZE_DEFAULT}
        onPageChange={setPage}
        onEdit={openEdit}
      />

      <TenantFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tenant={editingTenant}
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
  filters: {
    marginBottom: 16,
  },
};