import { useEffect } from 'react';
import { Form, Input, Modal, notification, Select, Switch } from 'antd';
import type { AxiosError } from 'axios';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import { useCategoryList } from '../../categories/hooks/useCategories';
import { GST_RATES } from '../../../types/product.types';
import type { ProductResponse } from '../../../types/product.types';

interface Props {
  open: boolean;
  onClose: () => void;
  product?: ProductResponse;
}

export const ProductFormModal = ({ open, onClose, product }: Props) => {
  const [form] = Form.useForm();
  const isEdit = !!product;

  const { mutate: create, isPending: creating } = useCreateProduct();
  const { mutate: update, isPending: updating } = useUpdateProduct(product?.id ?? '');

  const { data: categoriesPage } = useCategoryList({ size: 200, isActive: true });
  const categoryOptions = (categoriesPage?.content ?? []).map((c) => ({ label: c.name, value: c.id }));

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        isEdit
          ? {
              name: product.name,
              gstRate: product.gstRate,
              barcode: product.barcode ?? '',
              categoryId: product.categoryId ?? undefined,
              hsnCode: product.hsnCode ?? '',
              trackInventory: product.trackInventory,
            }
          : { trackInventory: true }
      );
    } else {
      form.resetFields();
    }
  }, [open, product, isEdit, form]);

  const onError = (error: unknown) => {
    const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
    notification.error({
      message: isEdit ? 'Failed to update product' : 'Failed to create product',
      description: message || 'An unexpected error occurred',
    });
  };

  const onFinish = (values: Record<string, unknown>) => {
    const payload = {
      name: values.name as string,
      gstRate: values.gstRate as number,
      barcode: (values.barcode as string) || undefined,
      categoryId: (values.categoryId as string) || undefined,
      hsnCode: (values.hsnCode as string) || undefined,
      trackInventory: values.trackInventory as boolean,
    };

    if (isEdit) {
      update(payload, { onSuccess: onClose, onError });
    } else {
      create(payload, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Product' : 'Create Product'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={creating || updating}
      destroyOnHidden
      width={520}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }} requiredMark={false}>
        <Form.Item
          label="Product Name"
          name="name"
          rules={[{ required: true, message: 'Product name is required' }]}
        >
          <Input placeholder="e.g. Tata Salt 1kg" />
        </Form.Item>

        <Form.Item
          label="GST Rate"
          name="gstRate"
          rules={[{ required: true, message: 'GST rate is required' }]}
        >
          <Select
            placeholder="Select GST slab"
            options={GST_RATES.map((r) => ({ label: `${r}%`, value: r }))}
          />
        </Form.Item>

        <Form.Item label="Category" name="categoryId">
          <Select
            placeholder="Select category (optional)"
            allowClear
            options={categoryOptions}
          />
        </Form.Item>

        <Form.Item label="HSN Code" name="hsnCode">
          <Input placeholder="e.g. 1001 (optional)" />
        </Form.Item>

        <Form.Item label="Barcode" name="barcode">
          <Input placeholder="e.g. 8901234567890 (optional)" />
        </Form.Item>

        <Form.Item label="Track Inventory" name="trackInventory" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};