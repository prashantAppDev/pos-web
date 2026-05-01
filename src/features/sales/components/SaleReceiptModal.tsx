import { Button, Descriptions, Divider, Modal, Table, Tag, Typography } from 'antd';
import type { CartItem, SaleResponse } from '../../../types/sale.types';

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  sale: SaleResponse;
  cartItems: CartItem[];
  onNewSale: () => void;
}

const PAYMENT_LABELS: Record<string, string> = { CASH: 'Cash', CARD: 'Card', UPI: 'UPI' };

export const SaleReceiptModal = ({ open, sale, cartItems, onNewSale }: Props) => {
  const mrpByProductId = Object.fromEntries(cartItems.map((c) => [c.productId, c.mrp]));

  const columns = [
    { title: 'Product', dataIndex: 'productName' },
    {
      title: 'MRP (₹)',
      key: 'mrp',
      width: 90,
      render: (_: unknown, record: { productId: string }) =>
        `₹${(mrpByProductId[record.productId] ?? 0).toFixed(2)}`,
    },
    {
      title: 'Price (₹)',
      dataIndex: 'sellingPrice',
      width: 90,
      render: (v: number) => `₹${v.toFixed(2)}`,
    },
    { title: 'Qty', dataIndex: 'quantity', width: 60 },
    {
      title: 'Total (₹)',
      dataIndex: 'totalPrice',
      width: 100,
      render: (v: number) => `₹${v.toFixed(2)}`,
    },
  ];

  return (
    <Modal
      open={open}
      title={null}
      footer={null}
      onCancel={onNewSale}
      width={560}
      destroyOnHidden
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Tag color="green" style={{ fontSize: 14, padding: '4px 16px' }}>Sale Complete</Tag>
        <Title level={3} style={{ margin: '8px 0 4px' }}>{sale.transactionId}</Title>
        <Text type="secondary">{new Date(sale.createdAt).toLocaleString('en-IN')}</Text>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={sale.items}
        pagination={false}
        size="small"
        style={{ marginBottom: 16 }}
      />

      <Divider style={{ margin: '12px 0' }} />

      <Descriptions size="small" column={2}>
        <Descriptions.Item label="Cashier">{sale.cashierName}</Descriptions.Item>
        <Descriptions.Item label="Payment">{PAYMENT_LABELS[sale.paymentMethod]}</Descriptions.Item>
        {sale.upiRefNumber && (
          <Descriptions.Item label="UPI Ref" span={2}>{sale.upiRefNumber}</Descriptions.Item>
        )}
        <Descriptions.Item label="Tax (GST)">₹{sale.taxAmount.toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label={<Text strong>Total</Text>}>
          <Text strong style={{ fontSize: 16 }}>₹{sale.netAmount.toFixed(2)}</Text>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Button type="primary" size="large" onClick={onNewSale}>
          New Sale
        </Button>
      </div>
    </Modal>
  );
};