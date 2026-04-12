import { useState } from 'react';
import { Button, Input, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, CheckCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { useDeleteStore, useStoreList, useToggleStoreStatus } from '../hooks/useStores';
import { StoreFormModal } from '../components/StoreFormModal';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { StoreResponse } from '../../../types/store.types';
import { notification } from 'antd';

const { Title } = Typography;
const { Search } = Input;

export const StoreListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreResponse | undefined>();

  const { data, isLoading } = useStoreList({
    page: page - 1,
    size: PAGE_SIZE_DEFAULT,
    search: search || undefined,
    isActive,
  });

  const { mutate: toggleStatus } = useToggleStoreStatus();
  const { mutate: deleteStore } = useDeleteStore();

  const openCreate = () => { setEditingStore(undefined); setModalOpen(true); };
  const openEdit = (store: StoreResponse) => { setEditingStore(store); setModalOpen(true); };

  const handleToggleStatus = (store: StoreResponse) => {
    toggleStatus(
      { id: store.id, isActive: !store.isActive },
      {
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Failed to update status', description: message });
        },
      }
    );
  };

  const handleDelete = (store: StoreResponse) => {
    deleteStore(store.id, {
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({ message: 'Failed to delete store', description: message });
      },
    });
  };

  const columns = [
    { title: 'Code', dataIndex: 'storeCode', width: 90 },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (name: string, record: StoreResponse) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/stores/${record.id}`)}>
          {name}
        </Button>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      ellipsis: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: 130,
      render: (phone: string | null) => phone ?? '—',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 100,
      render: (isActive: boolean) =>
        isActive
          ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
          : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 240,
      render: (_: unknown, record: StoreResponse) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/stores/${record.id}`)}>View</Button>
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm
            title={record.isActive ? 'Deactivate this store?' : 'Activate this store?'}
            onConfirm={() => handleToggleStatus(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small">
              {record.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </Popconfirm>
          {!record.isActive && (
            <Popconfirm
              title="Delete this store? This cannot be undone."
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button size="small" danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={styles.header}>
        <Title level={4} style={{ margin: 0 }}>Stores</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Store</Button>
      </div>

      <div style={styles.filters}>
        <Space>
          <Search
            placeholder="Search stores"
            allowClear
            onSearch={(v) => { setSearch(v); setPage(1); }}
            onChange={(e) => !e.target.value && setSearch('')}
            style={{ width: 260 }}
          />
          <Select
            defaultValue="all"
            onChange={(v) => { setIsActive(v === 'all' ? undefined : v === 'active'); setPage(1); }}
            style={{ width: 140 }}
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
        columns={columns}
        dataSource={data?.content}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE_DEFAULT,
          total: data?.totalElements ?? 0,
          onChange: setPage,
          showTotal: (total) => `${total} stores`,
          showSizeChanger: false,
        }}
      />

      <StoreFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        store={editingStore}
      />
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filters: { marginBottom: 16 },
};