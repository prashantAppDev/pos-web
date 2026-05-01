import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Descriptions, Drawer, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useReturn, useReturnList } from '../hooks/useReturns';
import { NewReturnModal } from '../components/NewReturnModal';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import { RETURN_REASON_LABELS } from '../../../types/return.types';
import type { ReturnItemResponse, ReturnSummaryResponse } from '../../../types/return.types';

const { Title, Text } = Typography;

const ReturnDetailDrawer = ({ storeId, returnId, onClose }: { storeId: string; returnId: string; onClose: () => void }) => {
  const { data, isLoading } = useReturn(storeId, returnId);

  return (
    <Drawer title="Return Details" open onClose={onClose} width={520}>
      {isLoading || !data ? null : (
        <>
          <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Original Sale" span={2}>
              <Text strong>{data.transactionId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Processed By">{data.processedByName}</Descriptions.Item>
            <Descriptions.Item label="Date">{new Date(data.createdAt).toLocaleString('en-IN')}</Descriptions.Item>
            {data.notes && (
              <Descriptions.Item label="Notes" span={2}>{data.notes}</Descriptions.Item>
            )}
          </Descriptions>

          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={data.items}
            columns={[
              { title: 'Product', dataIndex: 'productName' },
              { title: 'Price (₹)', dataIndex: 'sellingPrice', width: 90, render: (v: number) => `₹${v.toFixed(2)}` },
              { title: 'Qty', dataIndex: 'quantity', width: 60 },
              {
                title: 'Reason',
                dataIndex: 'reason',
                width: 130,
                render: (r: ReturnItemResponse['reason']) => (
                  <Tag>{RETURN_REASON_LABELS[r]}</Tag>
                ),
              },
              { title: 'Refund (₹)', dataIndex: 'totalPrice', width: 100, render: (v: number) => `₹${v.toFixed(2)}` },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
            <Text strong style={{ fontSize: 16 }}>Total Refund</Text>
            <Text strong style={{ fontSize: 18 }}>₹{data.totalAmount.toFixed(2)}</Text>
          </div>
        </>
      )}
    </Drawer>
  );
};

export const ReturnsHistoryPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [page, setPage] = useState(1);
  const [newReturnOpen, setNewReturnOpen] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);

  const { data, isLoading } = useReturnList(storeId!, page - 1, PAGE_SIZE_DEFAULT);

  const columns = [
    {
      title: 'Original Sale',
      dataIndex: 'transactionId',
      render: (txn: string, record: ReturnSummaryResponse) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => setSelectedReturnId(record.id)}>
          {txn}
        </Button>
      ),
    },
    { title: 'Items', dataIndex: 'itemCount', width: 70 },
    {
      title: 'Refund (₹)',
      dataIndex: 'totalAmount',
      width: 120,
      render: (v: number) => `₹${v.toFixed(2)}`,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: 160,
      render: (d: string) => new Date(d).toLocaleString('en-IN'),
    },
    {
      title: '',
      key: 'actions',
      width: 70,
      render: (_: unknown, record: ReturnSummaryResponse) => (
        <Button size="small" onClick={() => setSelectedReturnId(record.id)}>View</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={styles.header}>
        <Title level={4} style={{ margin: 0 }}>Returns</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewReturnOpen(true)}>
          New Return
        </Button>
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
          showTotal: (total) => `${total} returns`,
          showSizeChanger: false,
        }}
      />

      <NewReturnModal
        open={newReturnOpen}
        storeId={storeId!}
        onClose={() => setNewReturnOpen(false)}
      />

      {selectedReturnId && (
        <ReturnDetailDrawer
          storeId={storeId!}
          returnId={selectedReturnId}
          onClose={() => setSelectedReturnId(null)}
        />
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
};