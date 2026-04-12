import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Descriptions, notification, Popconfirm,
  Space, Spin, Table, Tag, Typography,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined,
  PauseCircleOutlined, PlusOutlined,
} from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { useDeleteStore, useStore, useToggleStoreStatus } from '../hooks/useStores';
import { useCounterList, useDeleteCounter, useToggleCounterStatus } from '../hooks/useCounters';
import { useUserList, useToggleUserStatus, useDeleteUser } from '../../users/hooks/useUsers';
import { useAuthStore } from '../../../store/auth.store';
import { StoreFormModal } from '../components/StoreFormModal';
import { CounterFormModal } from '../components/CounterFormModal';
import { InviteUserModal } from '../../users/components/InviteUserModal';
import { EditUserModal } from '../../users/components/EditUserModal';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { CounterResponse, StoreResponse } from '../../../types/store.types';
import type { StaffUserResponse } from '../../../types/user.types';

const { Title } = Typography;

export const StoreDetailPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');

  const [counterPage, setCounterPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [editingCounter, setEditingCounter] = useState<CounterResponse | undefined>();
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUserResponse | undefined>();

  const { data: store, isLoading: storeLoading } = useStore(storeId!);
  const { data: counters, isLoading: countersLoading } = useCounterList(storeId!, {
    page: counterPage - 1,
    size: PAGE_SIZE_DEFAULT,
  });

  const { data: users, isLoading: usersLoading } = useUserList({
    page: userPage - 1,
    size: PAGE_SIZE_DEFAULT,
    storeId: storeId,
    enabled: isAdmin,
  });

  const { mutate: toggleStore } = useToggleStoreStatus();
  const { mutate: deleteStore } = useDeleteStore();
  const { mutate: toggleCounter } = useToggleCounterStatus(storeId!);
  const { mutate: deleteCounter } = useDeleteCounter(storeId!);
  const { mutate: toggleUser } = useToggleUserStatus();
  const { mutate: deleteUser } = useDeleteUser();

  const handleToggleUser = (user: StaffUserResponse) => {
    toggleUser(
      { id: user.id, isActive: !user.isActive },
      {
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Failed to update user status', description: message });
        },
      }
    );
  };

  const handleDeleteUser = (user: StaffUserResponse) => {
    deleteUser(user.id, {
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({ message: 'Failed to delete user', description: message });
      },
    });
  };

  const handleToggleStore = (store: StoreResponse) => {
    toggleStore(
      { id: store.id, isActive: !store.isActive },
      {
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Failed to update store status', description: message });
        },
      }
    );
  };

  const handleToggleCounter = (counter: CounterResponse) => {
    toggleCounter(
      { id: counter.id, isActive: !counter.isActive },
      {
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Failed to update counter status', description: message });
        },
      }
    );
  };

  const handleDeleteStore = (store: StoreResponse) => {
    deleteStore(store.id, {
      onSuccess: () => navigate('/stores'),
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({ message: 'Failed to delete store', description: message });
      },
    });
  };

  const handleDeleteCounter = (counter: CounterResponse) => {
    deleteCounter(counter.id, {
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({ message: 'Failed to delete counter', description: message });
      },
    });
  };

  const openEditCounter = (counter: CounterResponse) => {
    setEditingCounter(counter);
    setCounterModalOpen(true);
  };

  const openAddCounter = () => {
    setEditingCounter(undefined);
    setCounterModalOpen(true);
  };

  const counterColumns = [
    { title: 'Code', dataIndex: 'counterCode', width: 80 },
    { title: 'Name', dataIndex: 'name' },
    {
      title: 'Device ID',
      dataIndex: 'deviceId',
      render: (id: string | null) => id ?? '—',
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
      width: 210,
      render: (_: unknown, record: CounterResponse) => (
        <Space>
          <Button size="small" onClick={() => openEditCounter(record)}>Edit</Button>
          <Popconfirm
            title={record.isActive ? 'Deactivate counter?' : 'Activate counter?'}
            onConfirm={() => handleToggleCounter(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small">{record.isActive ? 'Deactivate' : 'Activate'}</Button>
          </Popconfirm>
          {!record.isActive && (
            <Popconfirm
              title="Delete this counter? This cannot be undone."
              onConfirm={() => handleDeleteCounter(record)}
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

  if (storeLoading) {
    return <div style={styles.center}><Spin size="large" /></div>;
  }

  if (!store) return null;

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/stores')} />
          <Title level={4} style={{ margin: 0 }}>{store.name}</Title>
          {store.isActive
            ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
            : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag>}
        </Space>
        <Space>
          <Button onClick={() => setStoreModalOpen(true)}>Edit Store</Button>
          <Popconfirm
            title={store.isActive ? 'Deactivate this store?' : 'Activate this store?'}
            onConfirm={() => handleToggleStore(store)}
            okText="Yes"
            cancelText="No"
          >
            <Button>{store.isActive ? 'Deactivate' : 'Activate'}</Button>
          </Popconfirm>
          {!store.isActive && (
            <Popconfirm
              title="Delete this store? This cannot be undone."
              onConfirm={() => handleDeleteStore(store)}
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      {/* Store info */}
      <Descriptions bordered size="small" style={{ marginBottom: 32 }} column={2}>
        <Descriptions.Item label="Store Code">{store.storeCode}</Descriptions.Item>
        <Descriptions.Item label="Phone">{store.phone ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Address" span={2}>{store.address}</Descriptions.Item>
      </Descriptions>

      {/* Counters */}
      <div style={styles.countersHeader}>
        <Title level={5} style={{ margin: 0 }}>Counters</Title>
        <Button type="primary" icon={<PlusOutlined />} size="small" onClick={openAddCounter}>
          Add Counter
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={counterColumns}
        dataSource={counters?.content}
        loading={countersLoading}
        pagination={{
          current: counterPage,
          pageSize: PAGE_SIZE_DEFAULT,
          total: counters?.totalElements ?? 0,
          onChange: setCounterPage,
          showTotal: (total) => `${total} counters`,
          showSizeChanger: false,
        }}
      />

      {/* Staff — admin only */}
      {isAdmin && (
        <>
          <div style={{ ...styles.countersHeader, marginTop: 32 }}>
            <Title level={5} style={{ margin: 0 }}>Staff</Title>
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setInviteUserOpen(true)}>
              Invite Staff
            </Button>
          </div>

          <Table
            rowKey="id"
            columns={[
              { title: 'Name', dataIndex: 'name' },
              { title: 'Email', dataIndex: 'email' },
              {
                title: 'Role',
                dataIndex: 'role',
                width: 100,
                render: (role: string) => (
                  <Tag color={role === 'MANAGER' ? 'blue' : 'purple'}>
                    {role.charAt(0) + role.slice(1).toLowerCase()}
                  </Tag>
                ),
              },
              {
                title: 'Verified',
                dataIndex: 'isVerified',
                width: 90,
                render: (v: boolean) => v
                  ? <Tag color="success">Verified</Tag>
                  : <Tag color="warning">Pending</Tag>,
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
                width: 210,
                render: (_: unknown, record: StaffUserResponse) => (
                  <Space>
                    <Button size="small" onClick={() => setEditingUser(record)}>Edit</Button>
                    <Popconfirm
                      title={record.isActive ? 'Deactivate this user?' : 'Activate this user?'}
                      onConfirm={() => handleToggleUser(record)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button size="small">{record.isActive ? 'Deactivate' : 'Activate'}</Button>
                    </Popconfirm>
                    {!record.isActive && (
                      <Popconfirm
                        title="Delete this user? This cannot be undone."
                        onConfirm={() => handleDeleteUser(record)}
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
            ]}
            dataSource={users?.content}
            loading={usersLoading}
            pagination={{
              current: userPage,
              pageSize: PAGE_SIZE_DEFAULT,
              total: users?.totalElements ?? 0,
              onChange: setUserPage,
              showTotal: (total) => `${total} staff`,
              showSizeChanger: false,
            }}
          />
        </>
      )}

      <StoreFormModal
        open={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
        store={store}
      />

      <CounterFormModal
        open={counterModalOpen}
        onClose={() => setCounterModalOpen(false)}
        storeId={storeId!}
        counter={editingCounter}
      />

      <InviteUserModal
        open={inviteUserOpen}
        onClose={() => setInviteUserOpen(false)}
        storeId={storeId!}
        storeName={store.name}
      />

      {editingUser && (
        <EditUserModal
          open={!!editingUser}
          onClose={() => setEditingUser(undefined)}
          user={editingUser}
        />
      )}
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
  countersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
};