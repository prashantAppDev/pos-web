import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert, Button, Descriptions, notification, Popconfirm,
  Space, Spin, Table, Tag, Typography, Upload,
} from 'antd';
import {
  ArrowLeftOutlined, DownloadOutlined, UploadOutlined,
} from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { useReceipt, useConfirmReceipt, useDeleteReceipt, useRemoveItem, useImportItems } from '../hooks/useInventory';
import { AddItemModal } from '../components/AddItemModal';
import { EditItemModal } from '../components/EditItemModal';
import { downloadReceiptTemplate } from '../api/inventory.api';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { ReceiptItemResponse, ReceiptImportResult } from '../../../types/inventory.types';

const { Title, Text } = Typography;

export const GoodsReceiptDetailPage = () => {
  const { storeId, receiptId } = useParams<{ storeId: string; receiptId: string }>();
  const navigate = useNavigate();

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReceiptItemResponse | undefined>();
  const [importResult, setImportResult] = useState<ReceiptImportResult | null>(null);

  const { data: receipt, isLoading } = useReceipt(storeId!, receiptId!);
  const { mutate: confirmReceipt, isPending: confirming } = useConfirmReceipt();
  const { mutate: deleteReceipt, isPending: deleting } = useDeleteReceipt();
  const { mutate: removeItem } = useRemoveItem(storeId!, receiptId!);
  const { mutate: importItems, isPending: importing } = useImportItems(storeId!, receiptId!);

  const isDraft = receipt?.status === 'DRAFT';

  const handleConfirm = () => {
    confirmReceipt(
      { storeId: storeId!, receiptId: receiptId! },
      {
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Failed to confirm receipt', description: message });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteReceipt(
      { storeId: storeId!, receiptId: receiptId! },
      {
        onSuccess: () => navigate(`/stores/${storeId}/inventory?tab=receipts`),
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Failed to delete receipt', description: message });
        },
      }
    );
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId, {
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({ message: 'Failed to remove item', description: message });
      },
    });
  };

  const handleImport = (file: File) => {
    setImportResult(null);
    importItems(file, {
      onSuccess: (result) => setImportResult(result),
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({ message: 'Import failed', description: message });
      },
    });
    return false;
  };

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: unknown, record: ReceiptItemResponse) => (
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
    { title: 'Qty', dataIndex: 'quantity', width: 80 },
    {
      title: 'MRP (₹)',
      dataIndex: 'mrp',
      width: 100,
      render: (v: number) => `₹${v.toFixed(2)}`,
    },
    {
      title: 'Cost (₹)',
      dataIndex: 'costPrice',
      width: 100,
      render: (v: number | null) => v != null ? `₹${v.toFixed(2)}` : <Text type="secondary">—</Text>,
    },
    {
      title: 'Batch',
      dataIndex: 'batchNumber',
      width: 110,
      render: (b: string | null) => b ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Expiry',
      dataIndex: 'expiryDate',
      width: 110,
      render: (d: string | null) => d ?? <Text type="secondary">—</Text>,
    },
    ...(isDraft ? [{
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: ReceiptItemResponse) => (
        <Space>
          <Button size="small" onClick={() => setEditingItem(record)}>Edit</Button>
          <Popconfirm
            title="Remove this item?"
            onConfirm={() => handleRemoveItem(record.id)}
            okText="Remove"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Button size="small" danger>Remove</Button>
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  if (isLoading) return <div style={styles.center}><Spin size="large" /></div>;
  if (!receipt) return null;

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/stores/${storeId}/inventory?tab=receipts`)} />
          <Title level={4} style={{ margin: 0 }}>
            Receipt #{receipt.id.substring(0, 8).toUpperCase()}
          </Title>
          {receipt.status === 'DRAFT'
            ? <Tag color="orange">Draft</Tag>
            : <Tag color="green">Confirmed</Tag>}
        </Space>
        {isDraft && (
          <Space>
            <Popconfirm
              title="Delete this receipt? This cannot be undone."
              onConfirm={handleDelete}
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button danger loading={deleting}>Delete</Button>
            </Popconfirm>
            <Popconfirm
              title="Confirm this receipt? Stock will be updated and it cannot be edited."
              onConfirm={handleConfirm}
              okText="Confirm"
              cancelText="Cancel"
              disabled={receipt.items.length === 0}
            >
              <Button
                type="primary"
                loading={confirming}
                disabled={receipt.items.length === 0}
              >
                Confirm Receipt
              </Button>
            </Popconfirm>
          </Space>
        )}
      </div>

      {/* Receipt info */}
      <Descriptions bordered size="small" style={{ marginBottom: 24 }} column={2}>
        <Descriptions.Item label="Supplier">{receipt.supplierName ?? <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Created By">{receipt.createdByName}</Descriptions.Item>
        <Descriptions.Item label="Created">{new Date(receipt.createdAt).toLocaleString('en-IN')}</Descriptions.Item>
        {receipt.confirmedAt && (
          <Descriptions.Item label="Confirmed">{new Date(receipt.confirmedAt).toLocaleString('en-IN')}</Descriptions.Item>
        )}
        {receipt.notes && <Descriptions.Item label="Notes" span={2}>{receipt.notes}</Descriptions.Item>}
      </Descriptions>

      {/* Items section */}
      <div style={styles.sectionHeader}>
        <Title level={5} style={{ margin: 0 }}>Items ({receipt.items.length})</Title>
        {isDraft && (
          <Space>
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => downloadReceiptTemplate(storeId!)}
            >
              Template
            </Button>
            <Upload
              accept=".xlsx,.xls,.csv"
              showUploadList={false}
              beforeUpload={handleImport}
            >
              <Button icon={<UploadOutlined />} size="small" loading={importing}>
                Import Excel
              </Button>
            </Upload>
            <Button type="primary" size="small" onClick={() => setAddItemOpen(true)}>
              Add Item
            </Button>
          </Space>
        )}
      </div>

      {/* Import result */}
      {importResult && (
        <Alert
          style={{ marginBottom: 12 }}
          type={importResult.failed > 0 ? 'warning' : 'success'}
          showIcon
          message={`Import complete — ${importResult.added} added, ${importResult.merged} merged, ${importResult.failed} failed`}
          description={
            importResult.errors.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {importResult.errors.map((e) => (
                  <li key={e.row}>Row {e.row}: {e.reason}</li>
                ))}
              </ul>
            ) : undefined
          }
          closable
          onClose={() => setImportResult(null)}
        />
      )}

      <Table
        rowKey="id"
        columns={columns}
        dataSource={receipt.items}
        pagination={receipt.items.length > PAGE_SIZE_DEFAULT ? { pageSize: PAGE_SIZE_DEFAULT, showSizeChanger: false } : false}
        locale={{ emptyText: isDraft ? 'No items yet — add items manually or import from Excel' : 'No items' }}
      />

      <AddItemModal
        open={addItemOpen}
        storeId={storeId!}
        receiptId={receiptId!}
        onClose={() => setAddItemOpen(false)}
      />

      <EditItemModal
        open={!!editingItem}
        storeId={storeId!}
        receiptId={receiptId!}
        item={editingItem}
        onClose={() => setEditingItem(undefined)}
      />
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 },
};