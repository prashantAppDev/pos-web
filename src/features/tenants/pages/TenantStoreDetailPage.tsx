import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Descriptions, Space, Spin, Table, Tag, Typography,
} from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useSuperAdminStore, useSuperAdminCounterList } from '../hooks/useSuperAdminStores';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { CounterResponse } from '../../../types/store.types';

const { Title, Text } = Typography;

export const TenantStoreDetailPage = () => {
  const { tenantId, storeId } = useParams<{ tenantId: string; storeId: string }>();
  const navigate = useNavigate();

  const [counterPage, setCounterPage] = useState(1);

  const { data: store, isLoading: storeLoading } = useSuperAdminStore(tenantId!, storeId!);
  const { data: counters, isLoading: countersLoading } = useSuperAdminCounterList(tenantId!, storeId!, {
    page: counterPage - 1,
    size: PAGE_SIZE_DEFAULT,
  });

  const counterColumns = [
    { title: 'Code', dataIndex: 'counterCode', width: 80 },
    { title: 'Name', dataIndex: 'name' },
    {
      title: 'Device ID',
      dataIndex: 'deviceId',
      render: (id: string | null) => id ?? <Text type="secondary">—</Text>,
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/tenants/${tenantId}`)} />
          <Title level={4} style={{ margin: 0 }}>{store.name}</Title>
          {store.isActive
            ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
            : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag>}
        </Space>
      </div>

      {/* Store info */}
      <Descriptions bordered size="small" style={{ marginBottom: 32 }} column={2}>
        <Descriptions.Item label="Store Code">{store.storeCode}</Descriptions.Item>
        <Descriptions.Item label="Phone">{store.phone ?? <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Address" span={2}>{store.address}</Descriptions.Item>
      </Descriptions>

      {/* Counters */}
      <div style={styles.sectionHeader}>
        <Title level={5} style={{ margin: 0 }}>Counters</Title>
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
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
};
