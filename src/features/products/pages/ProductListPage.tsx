import { useState } from 'react';
import { Alert, Button, Input, notification, Popconfirm, Select, Space, Table, Tag, Typography, Upload } from 'antd';
import { CheckCircleOutlined, DownloadOutlined, PauseCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { useDeleteProduct, useImportProducts, useProductList, useToggleProductStatus } from '../hooks/useProducts';
import { useCategoryList } from '../../categories/hooks/useCategories';
import { downloadProductTemplate } from '../api/product.api';
import { ProductFormModal } from '../components/ProductFormModal';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { ProductImportResult, ProductResponse } from '../../../types/product.types';

const { Title, Text } = Typography;
const { Search } = Input;

export const ProductListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | undefined>();
  const [importResult, setImportResult] = useState<ProductImportResult | null>(null);

  const { data, isLoading } = useProductList({
    page: page - 1,
    size: PAGE_SIZE_DEFAULT,
    search: search || undefined,
    categoryId,
    isActive,
  });

  const { data: categoriesPage } = useCategoryList({ size: 200, isActive: true });
  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    ...(categoriesPage?.content ?? []).map((c) => ({ label: c.name, value: c.id })),
  ];

  const { mutate: toggleStatus } = useToggleProductStatus();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: importProducts, isPending: importing } = useImportProducts();

  const openCreate = () => { setEditingProduct(undefined); setModalOpen(true); };
  const openEdit = (product: ProductResponse) => { setEditingProduct(product); setModalOpen(true); };

  const handleToggleStatus = (product: ProductResponse) => {
    toggleStatus(
      { id: product.id, isActive: !product.isActive },
      {
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Failed to update status', description: message });
        },
      }
    );
  };

  const handleDelete = (product: ProductResponse) => {
    deleteProduct(product.id, {
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({ message: 'Failed to delete product', description: message });
      },
    });
  };

  const handleImport = (file: File) => {
    setImportResult(null);
    importProducts(file, {
      onSuccess: (result) => setImportResult(result),
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({ message: 'Import failed', description: message });
      },
    });
    return false;
  };

  const columns = [
    { title: 'SKU', dataIndex: 'sku', width: 110 },
    { title: 'Name', dataIndex: 'name' },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      width: 140,
      render: (name: string | null) => name ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'GST',
      dataIndex: 'gstRate',
      width: 70,
      render: (rate: number) => `${rate}%`,
    },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      width: 150,
      render: (barcode: string | null) => barcode ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Track Inv.',
      dataIndex: 'trackInventory',
      width: 95,
      render: (track: boolean) =>
        track ? <Tag color="blue">Yes</Tag> : <Tag color="default">No</Tag>,
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
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_: unknown, record: ProductResponse) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm
            title={record.isActive ? 'Deactivate this product?' : 'Activate this product?'}
            onConfirm={() => handleToggleStatus(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small">{record.isActive ? 'Deactivate' : 'Activate'}</Button>
          </Popconfirm>
          {!record.isActive && (
            <Popconfirm
              title="Delete this product? This cannot be undone."
              onConfirm={() => handleDelete(record)}
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

  return (
    <div>
      <div style={styles.header}>
        <Title level={4} style={{ margin: 0 }}>Products</Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={downloadProductTemplate}>
            Template
          </Button>
          <Upload accept=".xlsx,.xls,.csv" showUploadList={false} beforeUpload={handleImport}>
            <Button icon={<UploadOutlined />} loading={importing}>Import</Button>
          </Upload>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Product</Button>
        </Space>
      </div>

      {importResult && (
        <Alert
          style={{ marginBottom: 16 }}
          type={importResult.failed > 0 ? 'warning' : 'success'}
          showIcon
          message={`Import complete — ${importResult.created} created, ${importResult.skipped} skipped, ${importResult.failed} failed`}
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

      <div style={styles.filters}>
        <Space wrap>
          <Search
            placeholder="Search by name, SKU or barcode"
            allowClear
            onSearch={(v) => { setSearch(v); setPage(1); }}
            onChange={(e) => !e.target.value && setSearch('')}
            style={{ width: 280 }}
          />
          <Select
            defaultValue="all"
            onChange={(v) => { setCategoryId(v === 'all' ? undefined : v); setPage(1); }}
            style={{ width: 180 }}
            options={categoryOptions}
          />
          <Select
            defaultValue="all"
            onChange={(v) => { setIsActive(v === 'all' ? undefined : v === 'active'); setPage(1); }}
            style={{ width: 140 }}
            options={[
              { label: 'All Products', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </Space>
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
          showTotal: (total) => `${total} products`,
          showSizeChanger: false,
        }}
      />

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
      />
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filters: { marginBottom: 16 },
};