import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, notification } from 'antd';
import type { AxiosError } from 'axios';
import { useUpdateItem } from '../hooks/useInventory';
import type { ReceiptItemResponse } from '../../../types/inventory.types';

interface Props {
  open: boolean;
  storeId: string;
  receiptId: string;
  item?: ReceiptItemResponse;
  onClose: () => void;
}

export const EditItemModal = ({ open, storeId, receiptId, item, onClose }: Props) => {
  const [form] = Form.useForm();
  const { mutate: updateItem, isPending } = useUpdateItem(storeId, receiptId);

  useEffect(() => {
    if (open && item) {
      form.setFieldsValue({
        quantity: item.quantity,
        mrp: item.mrp,
        costPrice: item.costPrice ?? undefined,
        batchNumber: item.batchNumber ?? '',
        expiryDate: item.expiryDate ?? '',
      });
    } else {
      form.resetFields();
    }
  }, [open, item, form]);

  const onFinish = (values: Record<string, unknown>) => {
    if (!item) return;
    updateItem(
      {
        itemId: item.id,
        request: {
          quantity: values.quantity as number,
          mrp: values.mrp as number,
          costPrice: (values.costPrice as number) || undefined,
          batchNumber: (values.batchNumber as string) || undefined,
          expiryDate: (values.expiryDate as string) || undefined,
        },
      },
      {
        onSuccess: onClose,
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Failed to update item', description: message });
        },
      }
    );
  };

  return (
    <Modal
      title="Edit Item"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Save"
      confirmLoading={isPending}
      destroyOnHidden
      width={440}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }} requiredMark={false}>
        <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: 'Required' }]}>
          <InputNumber min={0.01} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="MRP (₹)" name="mrp" rules={[{ required: true, message: 'Required' }]}>
          <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Cost Price (₹)" name="costPrice">
          <InputNumber min={0.01} precision={2} style={{ width: '100%' }} placeholder="Optional" />
        </Form.Item>
        <Form.Item label="Batch Number" name="batchNumber">
          <Input placeholder="Optional" />
        </Form.Item>
        <Form.Item label="Expiry Date" name="expiryDate">
          <Input placeholder="YYYY-MM-DD (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};