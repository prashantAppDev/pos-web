import { useEffect, useState } from 'react';
import { Alert, Form, Input, InputNumber, Modal, notification, Select, Typography } from 'antd';
import type { AxiosError } from 'axios';
import { useAddItem } from '../hooks/useInventory';
import { useCategoryList } from '../../categories/hooks/useCategories';
import { searchProducts } from '../../products/api/product.api';
import { GST_RATES } from '../../../types/product.types';
import type { ProductResponse } from '../../../types/product.types';

const { Text } = Typography;

type LookupState =
  | { phase: 'idle' }
  | { phase: 'searching' }
  | { phase: 'found'; product: ProductResponse }
  | { phase: 'not_found' };

interface Props {
  open: boolean;
  storeId: string;
  receiptId: string;
  onClose: () => void;
}

export const AddItemModal = ({ open, storeId, receiptId, onClose }: Props) => {
  const [form] = Form.useForm();
  const [lookup, setLookup] = useState<LookupState>({ phase: 'idle' });
  const { mutate: addItem, isPending } = useAddItem(storeId, receiptId);
  const { data: categoriesPage } = useCategoryList({ size: 200, isActive: true });
  const categoryOptions = (categoriesPage?.content ?? []).map((c) => ({ label: c.name, value: c.id }));

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setLookup({ phase: 'idle' });
    }
  }, [open, form]);

  const handleLookup = async () => {
    const barcode = form.getFieldValue('barcode')?.trim();
    if (!barcode) return;
    setLookup({ phase: 'searching' });
    try {
      const results = await searchProducts(barcode);
      const exact = results.find((p) => p.barcode === barcode);
      setLookup(exact ? { phase: 'found', product: exact } : { phase: 'not_found' });
    } catch {
      setLookup({ phase: 'not_found' });
    }
  };

  const onFinish = (values: Record<string, unknown>) => {
    const request = {
      barcode: values.barcode as string,
      quantity: values.quantity as number,
      mrp: values.mrp as number,
      costPrice: (values.costPrice as number) || undefined,
      batchNumber: (values.batchNumber as string) || undefined,
      expiryDate: (values.expiryDate as string) || undefined,
      ...(lookup.phase === 'not_found' && {
        productName: values.productName as string,
        gstRate: values.gstRate as number,
        categoryId: (values.categoryId as string) || undefined,
      }),
    };

    addItem(request, {
      onSuccess: onClose,
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({ message: 'Failed to add item', description: message });
      },
    });
  };

  const isReady = lookup.phase === 'found' || lookup.phase === 'not_found';

  return (
    <Modal
      title="Add Item"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Add"
      okButtonProps={{ disabled: !isReady }}
      confirmLoading={isPending}
      destroyOnHidden
      width={520}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }} requiredMark={false}>

        {/* Barcode lookup */}
        <Form.Item label="Barcode" name="barcode" rules={[{ required: true, message: 'Barcode is required' }]}>
          <Input.Search
            placeholder="Scan or type barcode, then press Find"
            enterButton="Find"
            loading={lookup.phase === 'searching'}
            onSearch={handleLookup}
          />
        </Form.Item>

        {/* Lookup result */}
        {lookup.phase === 'found' && (
          <Alert
            type="success"
            showIcon
            message={<Text>{lookup.product.name} <Text type="secondary">— SKU: {lookup.product.sku}</Text></Text>}
            style={{ marginBottom: 16 }}
          />
        )}
        {lookup.phase === 'not_found' && (
          <Alert
            type="warning"
            showIcon
            message="Product not found — fill in details to create it"
            style={{ marginBottom: 16 }}
          />
        )}

        {/* New product fields — only when not found */}
        {lookup.phase === 'not_found' && (
          <>
            <Form.Item label="Product Name" name="productName" rules={[{ required: true, message: 'Required for new product' }]}>
              <Input placeholder="e.g. Tata Salt 1kg" />
            </Form.Item>
            <Form.Item label="GST Rate" name="gstRate" rules={[{ required: true, message: 'Required for new product' }]}>
              <Select placeholder="Select GST slab" options={GST_RATES.map((r) => ({ label: `${r}%`, value: r }))} />
            </Form.Item>
            <Form.Item label="Category" name="categoryId">
              <Select placeholder="Select category (optional)" allowClear options={categoryOptions} />
            </Form.Item>
          </>
        )}

        {/* Item fields — shown once barcode is resolved */}
        {isReady && (
          <>
            <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: 'Required' }]}>
              <InputNumber min={0.01} style={{ width: '100%' }} placeholder="e.g. 100" />
            </Form.Item>
            <Form.Item label="MRP (₹)" name="mrp" rules={[{ required: true, message: 'Required' }]}>
              <InputNumber min={0.01} precision={2} style={{ width: '100%' }} placeholder="e.g. 45.00" />
            </Form.Item>
            <Form.Item label="Cost Price (₹)" name="costPrice">
              <InputNumber min={0.01} precision={2} style={{ width: '100%' }} placeholder="Optional" />
            </Form.Item>
            <Form.Item label="Batch Number" name="batchNumber">
              <Input placeholder="e.g. BATCH001 (optional)" />
            </Form.Item>
            <Form.Item label="Expiry Date" name="expiryDate">
              <Input placeholder="YYYY-MM-DD (optional)" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};