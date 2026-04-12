import { Card, Col, Row, Statistic, Table, Tag, Typography, Button } from 'antd';
import { ShopOutlined, CheckCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStoreList } from '../../stores/hooks/useStores';
import type { StoreResponse } from '../../../types/store.types';

const { Title } = Typography;

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useStoreList({ page: 0, size: 100 });

  const stores = data?.content ?? [];
  const totalStores = data?.totalElements ?? 0;
  const activeStores = stores.filter((s) => s.isActive).length;

  const columns = [
    {
      title: 'Code',
      dataIndex: 'storeCode',
      width: 90,
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
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
      title: '',
      key: 'action',
      width: 80,
      render: (_: unknown, record: StoreResponse) => (
        <Button size="small" onClick={() => navigate(`/stores/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: 0, marginBottom: 24 }}>Dashboard</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Stores"
              value={totalStores}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Stores"
              value={activeStores}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Title level={5} style={{ marginBottom: 12 }}>Stores Overview</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={stores}
        loading={isLoading}
        pagination={false}
        size="small"
      />
    </div>
  );
};