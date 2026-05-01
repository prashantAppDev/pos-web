import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Descriptions, Drawer, Table, Tag, Typography } from 'antd';
import { useSale, useSaleList } from '../hooks/useSales';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { PaymentMethod, PaymentStatus, SaleSummaryResponse } from '../../../types/sale.types';

const { Title, Text } = Typography;

const PAYMENT_COLORS: Record<PaymentMethod, string> = { CASH: 'default', UPI: 'blue', CARD: 'purple' };
const STATUS_COLORS: Record<PaymentStatus, string> = { COMPLETED: 'success', PENDING: 'warning', FAILED: 'error' };

const SaleDetailDrawer = ({ storeId, saleId, onClose }: { storeId: string; saleId: string; onClose: () => void }) => {
  const { data: sale, isLoading } = useSale(storeId, saleId);

  return (
    <Drawer title="Sale Details" open onClose={onClose} width={560}>
      {isLoading || !sale ? null : (
        <>
          <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Transaction ID" span={2}>
              <Text strong>{sale.transactionId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Cashier">{sale.cashierName}</Descriptions.Item>
            <Descriptions.Item label="Date">{new Date(sale.createdAt).toLocaleString('en-IN')}</Descriptions.Item>
            <Descriptions.Item label="Payment">
              <Tag color={PAYMENT_COLORS[sale.paymentMethod]}>{sale.paymentMethod}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={STATUS_COLORS[sale.paymentStatus]}>{sale.paymentStatus}</Tag>
            </Descriptions.Item>
            {sale.upiRefNumber && (
              <Descriptions.Item label="UPI Ref" span={2}>{sale.upiRefNumber}</Descriptions.Item>
            )}
          </Descriptions>

          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={sale.items}
            columns={[
              { title: 'Product', dataIndex: 'productName' },
              { title: 'Price (₹)', dataIndex: 'sellingPrice', width: 90, render: (v: number) => `₹${v.toFixed(2)}` },
              { title: 'Qty', dataIndex: 'quantity', width: 60 },
              { title: 'Total (₹)', dataIndex: 'totalPrice', width: 100, render: (v: number) => `₹${v.toFixed(2)}` },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
            <Text>GST</Text>
            <Text>₹{sale.taxAmount.toFixed(2)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong style={{ fontSize: 16 }}>Total</Text>
            <Text strong style={{ fontSize: 18 }}>₹{sale.netAmount.toFixed(2)}</Text>
          </div>
        </>
      )}
    </Drawer>
  );
};

export const SalesHistoryPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [page, setPage] = useState(1);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const { data, isLoading } = useSaleList(storeId!, {
    page: page - 1,
    size: PAGE_SIZE_DEFAULT,
  });

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      render: (txn: string, record: SaleSummaryResponse) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => setSelectedSaleId(record.id)}>
          {txn}
        </Button>
      ),
    },
    { title: 'Items', dataIndex: 'itemCount', width: 70 },
    {
      title: 'Total (₹)',
      dataIndex: 'netAmount',
      width: 110,
      render: (v: number) => `₹${v.toFixed(2)}`,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      width: 90,
      render: (m: PaymentMethod) => <Tag color={PAYMENT_COLORS[m]}>{m}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      width: 100,
      render: (s: PaymentStatus) => <Tag color={STATUS_COLORS[s]}>{s}</Tag>,
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
      render: (_: unknown, record: SaleSummaryResponse) => (
        <Button size="small" onClick={() => setSelectedSaleId(record.id)}>View</Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>Sales History</Title>

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
          showTotal: (total) => `${total} sales`,
          showSizeChanger: false,
        }}
      />

      {selectedSaleId && (
        <SaleDetailDrawer
          storeId={storeId!}
          saleId={selectedSaleId}
          onClose={() => setSelectedSaleId(null)}
        />
      )}
    </div>
  );
};