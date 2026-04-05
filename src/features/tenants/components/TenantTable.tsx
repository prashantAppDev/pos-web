import { Button, Popconfirm, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDeleteTenant, useToggleTenantStatus } from '../hooks/useTenants';
import { TenantStatusBadge } from './TenantStatusBadge';
import type { TenantResponse } from '../../../types/tenant.types';
import type { PageResponse } from '../../../types/common.types';

const { Text } = Typography;

interface Props {
  data: PageResponse<TenantResponse> | undefined;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (tenant: TenantResponse) => void;
}

export const TenantTable = ({ data, loading, page, pageSize, onPageChange, onEdit }: Props) => {
  const { mutate: toggleStatus, isPending: toggling } = useToggleTenantStatus();
  const { mutate: deleteTenant, isPending: deleting } = useDeleteTenant();

  const columns: ColumnsType<TenantResponse> = [
    {
      title: 'Code',
      dataIndex: 'tenantCode',
      width: 90,
    },
    {
      title: 'Business Name',
      dataIndex: 'name',
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: 130,
    },
    {
      title: 'GST',
      dataIndex: 'gstNumber',
      width: 160,
      render: (gst: string | null) => gst ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Plan',
      dataIndex: 'subscription',
      width: 100,
      render: (plan: string) => (
        <Text style={{ textTransform: 'capitalize' }}>{plan.toLowerCase()}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 90,
      render: (isActive: boolean) => <TenantStatusBadge isActive={isActive} />,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('en-IN'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>
            Edit
          </Button>

          <Popconfirm
            title={record.isActive ? 'Deactivate this tenant?' : 'Activate this tenant?'}
            description={record.isActive ? 'They will lose access immediately.' : 'They will regain access.'}
            onConfirm={() => toggleStatus({ id: record.id, isActive: !record.isActive })}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" loading={toggling}>
              {record.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </Popconfirm>

          {!record.isActive && (
            <Popconfirm
              title="Delete this tenant?"
              description="This action cannot be undone."
              onConfirm={() => deleteTenant(record.id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button size="small" danger loading={deleting}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data?.content}
      loading={loading}
      pagination={{
        current: page,
        pageSize,
        total: data?.totalElements ?? 0,
        onChange: onPageChange,
        showTotal: (total) => `${total} tenants`,
        showSizeChanger: false,
      }}
    />
  );
};