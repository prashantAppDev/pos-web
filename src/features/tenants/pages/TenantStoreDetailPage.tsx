import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Descriptions, Drawer, Space, Spin, Table, Tag, Typography,
} from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useSuperAdminStore, useSuperAdminCounterList, useSuperAdminCounter, useSuperAdminUserList } from '../hooks/useSuperAdminStores';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { CounterResponse } from '../../../types/store.types';
import type { StaffUserResponse } from '../../../types/user.types';

const { Title, Text } = Typography;

const CounterDetailDrawer = ({ tenantId, storeId, counterId, onClose }: { tenantId: string; storeId: string; counterId: string; onClose: () => void }) => {
  const { data: counter, isLoading } = useSuperAdminCounter(tenantId, storeId, counterId);
  return (
    <Drawer title="Counter Details" open onClose={onClose} width={360}>
      {isLoading || !counter ? <Spin /> : (
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Counter Code">{counter.counterCode}</Descriptions.Item>
          <Descriptions.Item label="Name">{counter.name}</Descriptions.Item>
          <Descriptions.Item label="Device ID">
            {counter.deviceId ?? <Text type="secondary">—</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {counter.isActive
              ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
              : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag>}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Drawer>
  );
};

export const TenantStoreDetailPage = () => {
  const { tenantId, storeId } = useParams<{ tenantId: string; storeId: string }>();
  const navigate = useNavigate();

  const [counterPage, setCounterPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [selectedCounterId, setSelectedCounterId] = useState<string | null>(null);

  const { data: store, isLoading: storeLoading } = useSuperAdminStore(tenantId!, storeId!);
  const { data: counters, isLoading: countersLoading } = useSuperAdminCounterList(tenantId!, storeId!, {
    page: counterPage - 1,
    size: PAGE_SIZE_DEFAULT,
  });
  const { data: users, isLoading: usersLoading } = useSuperAdminUserList(tenantId!, {
    page: userPage - 1,
    size: PAGE_SIZE_DEFAULT,
    storeId,
  });

  if (storeLoading) return <div style={styles.center}><Spin size="large" /></div>;
  if (!store) return null;

  return (
    <div>
      <div style={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/tenants/${tenantId}`)} />
          <Title level={4} style={{ margin: 0 }}>{store.name}</Title>
          {store.isActive
            ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
            : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag>}
        </Space>
      </div>

      <Descriptions bordered size="small" style={{ marginBottom: 32 }} column={2}>
        <Descriptions.Item label="Store Code">{store.storeCode}</Descriptions.Item>
        <Descriptions.Item label="Phone">{store.phone ?? <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Address" span={2}>{store.address}</Descriptions.Item>
      </Descriptions>

      {/* Counters */}
      <Title level={5} style={{ marginBottom: 12 }}>Counters</Title>
      <Table
        rowKey="id"
        loading={countersLoading}
        dataSource={counters?.content}
        pagination={{
          current: counterPage, pageSize: PAGE_SIZE_DEFAULT,
          total: counters?.totalElements ?? 0, onChange: setCounterPage,
          showTotal: (t) => `${t} counters`, showSizeChanger: false,
        }}
        columns={[
          { title: 'Code', dataIndex: 'counterCode', width: 80 },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Device ID', dataIndex: 'deviceId', render: (id: string | null) => id ?? <Text type="secondary">—</Text> },
          { title: 'Status', dataIndex: 'isActive', width: 100, render: (a: boolean) =>
            a ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
              : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag> },
          { title: '', key: 'actions', width: 70, render: (_: unknown, r: CounterResponse) => (
            <Button size="small" onClick={() => setSelectedCounterId(r.id)}>View</Button>
          )},
        ] satisfies import('antd').TableColumnsType<CounterResponse>}
      />

      {/* Staff */}
      <Title level={5} style={{ margin: '32px 0 12px' }}>Staff</Title>
      <Table
        rowKey="id"
        loading={usersLoading}
        dataSource={users?.content}
        pagination={{
          current: userPage, pageSize: PAGE_SIZE_DEFAULT,
          total: users?.totalElements ?? 0, onChange: setUserPage,
          showTotal: (t) => `${t} staff`, showSizeChanger: false,
        }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Role', dataIndex: 'role', width: 100, render: (r: string) =>
            <Tag color={r === 'MANAGER' ? 'blue' : 'purple'}>{r.charAt(0) + r.slice(1).toLowerCase()}</Tag> },
          { title: 'Verified', dataIndex: 'isVerified', width: 90, render: (v: boolean) =>
            v ? <Tag color="success">Verified</Tag> : <Tag color="warning">Pending</Tag> },
          { title: 'Status', dataIndex: 'isActive', width: 100, render: (a: boolean) =>
            a ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
              : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag> },
        ] satisfies import('antd').TableColumnsType<StaffUserResponse>}
      />

      {selectedCounterId && (
        <CounterDetailDrawer
          tenantId={tenantId!}
          storeId={storeId!}
          counterId={selectedCounterId}
          onClose={() => setSelectedCounterId(null)}
        />
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 },
};