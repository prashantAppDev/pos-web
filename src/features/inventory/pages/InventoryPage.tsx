import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button, Drawer, Input, Select, Space, Spin, Table, Tag, Tabs, Typography,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { notification } from 'antd';
import { useReceiptList } from '../hooks/useInventory';
import { useStockLevels, useProductBatches } from '../hooks/useInventory';
import { CreateReceiptModal } from '../components/CreateReceiptModal';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { BatchResponse, ReceiptSummaryResponse, ReceiptStatus, StockLevelResponse } from '../../../types/inventory.types';

const { Title, Text } = Typography;

// ── Stock Tab ────────────────────────────────────────────────

const StockTab = ({ storeId }: { storeId: string }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<StockLevelResponse | null>(null);

  const { data, isLoading } = useStockLevels(storeId, {
    page: page - 1,
    size: PAGE_SIZE_DEFAULT,
    search: search || undefined,
  });

  const { data: batches, isLoading: batchesLoading } = useProductBatches(
    storeId,
    selectedProduct?.productId ?? null
  );

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: unknown, record: StockLevelResponse) => (
        <div>
          <div>{record.productName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>SKU: {record.sku}</Text>
        </div>
      ),
    },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      width: 150,
      render: (b: string | null) => b ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Qty Available',
      dataIndex: 'quantity',
      width: 130,
      render: (q: number) => <Text strong>{q}</Text>,
    },
    {
      title: 'Last Restock',
      dataIndex: 'lastRestockAt',
      width: 150,
      render: (d: string | null) =>
        d ? new Date(d).toLocaleDateString('en-IN') : <Text type="secondary">—</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: StockLevelResponse) => (
        <Button size="small" onClick={() => setSelectedProduct(record)}>
          View Batches
        </Button>
      ),
    },
  ];

  const batchColumns = [
    { title: 'MRP (₹)', dataIndex: 'mrp', width: 100, render: (v: number) => `₹${v.toFixed(2)}` },
    { title: 'Selling (₹)', dataIndex: 'sellingPrice', width: 110, render: (v: number) => `₹${v.toFixed(2)}` },
    {
      title: 'Cost (₹)',
      dataIndex: 'costPrice',
      width: 100,
      render: (v: number | null) => v != null ? `₹${v.toFixed(2)}` : <Text type="secondary">—</Text>,
    },
    { title: 'Qty Left', dataIndex: 'quantityRemaining', width: 90 },
    {
      title: 'Batch No.',
      dataIndex: 'batchNumber',
      width: 110,
      render: (b: string | null) => b ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Expiry',
      dataIndex: 'expiryDate',
      width: 100,
      render: (d: string | null) => d ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Received',
      dataIndex: 'receivedAt',
      width: 120,
      render: (d: string) => new Date(d).toLocaleDateString('en-IN'),
    },
  ];

  return (
    <>
      <div style={styles.filters}>
        <Input.Search
          placeholder="Search by name, SKU or barcode"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          allowClear
          onClear={() => { setSearch(''); setPage(1); }}
          style={{ width: 300 }}
        />
      </div>

      <Table
        rowKey="productId"
        columns={columns}
        dataSource={data?.content}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE_DEFAULT,
          total: data?.totalElements ?? 0,
          onChange: setPage,
          showTotal: (total) => `${total} products`,
          showSizeChanger: false,
        }}
      />

      <Drawer
        title={
          selectedProduct ? (
            <div>
              <div>{selectedProduct.productName}</div>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                SKU: {selectedProduct.sku} · Total available: {selectedProduct.quantity}
              </Text>
            </div>
          ) : 'Batches'
        }
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        width={720}
      >
        {batchesLoading ? (
          <div style={styles.center}><Spin /></div>
        ) : (
          <Table
            rowKey="id"
            columns={batchColumns}
            dataSource={batches}
            pagination={false}
            size="small"
            locale={{ emptyText: 'No batches found' }}
          />
        )}
      </Drawer>
    </>
  );
};

// ── Receipts Tab ─────────────────────────────────────────────

const ReceiptsTab = ({ storeId }: { storeId: string }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReceiptStatus | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useReceiptList(storeId, {
    page: page - 1,
    size: PAGE_SIZE_DEFAULT,
    status,
  });

  const columns = [
    {
      title: 'Reference',
      dataIndex: 'id',
      width: 130,
      render: (id: string, record: ReceiptSummaryResponse) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => navigate(`/stores/${storeId}/inventory/receipts/${record.id}`)}
        >
          #{id.substring(0, 8).toUpperCase()}
        </Button>
      ),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      render: (name: string | null) => name ?? <Text type="secondary">—</Text>,
    },
    { title: 'Items', dataIndex: 'itemCount', width: 70 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (s: ReceiptStatus) =>
        s === 'DRAFT'
          ? <Tag color="orange">Draft</Tag>
          : <Tag color="green">Confirmed</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: 130,
      render: (d: string) => new Date(d).toLocaleDateString('en-IN'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: ReceiptSummaryResponse) => (
        <Button size="small" onClick={() => navigate(`/stores/${storeId}/inventory/receipts/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Select
          defaultValue="all"
          onChange={(v) => { setStatus(v === 'all' ? undefined : v as ReceiptStatus); setPage(1); }}
          style={{ width: 160 }}
          options={[
            { label: 'All Receipts', value: 'all' },
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Confirmed', value: 'CONFIRMED' },
          ]}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          New Receipt
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
          showTotal: (total) => `${total} receipts`,
          showSizeChanger: false,
        }}
      />

      <CreateReceiptModal
        open={createOpen}
        storeId={storeId}
        onClose={() => setCreateOpen(false)}
        onCreated={(receipt) => navigate(`/stores/${storeId}/inventory/receipts/${receipt.id}`)}
      />
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────

export const InventoryPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'stock';

  return (
    <div>
      <div style={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/stores/${storeId}`)} />
          <Title level={4} style={{ margin: 0 }}>Inventory</Title>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setSearchParams(key === 'stock' ? {} : { tab: key })}
        items={[
          {
            key: 'stock',
            label: 'Stock Levels',
            children: <StockTab storeId={storeId!} />,
          },
          {
            key: 'receipts',
            label: 'Goods Receipts',
            children: <ReceiptsTab storeId={storeId!} />,
          },
        ]}
      />
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  filters: { marginBottom: 16 },
  center: { display: 'flex', justifyContent: 'center', padding: 40 },
};