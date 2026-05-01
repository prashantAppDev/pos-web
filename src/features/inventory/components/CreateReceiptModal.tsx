import { useEffect } from 'react';
import { Form, Input, Modal, notification } from 'antd';
import type { AxiosError } from 'axios';
import { useCreateReceipt } from '../hooks/useInventory';
import type { ReceiptResponse } from '../../../types/inventory.types';

interface Props {
  open: boolean;
  storeId: string;
  onClose: () => void;
  onCreated: (receipt: ReceiptResponse) => void;
}

export const CreateReceiptModal = ({ open, storeId, onClose, onCreated }: Props) => {
  const [form] = Form.useForm();
  const { mutate: create, isPending } = useCreateReceipt();

  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  const onFinish = (values: { supplierName?: string; notes?: string }) => {
    create(
      {
        storeId,
        request: {
          supplierName: values.supplierName || undefined,
          notes: values.notes || undefined,
        },
      },
      {
        onSuccess: (receipt) => { onClose(); onCreated(receipt); },
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Failed to create receipt', description: message });
        },
      }
    );
  };

  return (
    <Modal
      title="New Goods Receipt"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Create"
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }} requiredMark={false}>
        <Form.Item label="Supplier Name" name="supplierName">
          <Input placeholder="e.g. Hindustan Unilever (optional)" />
        </Form.Item>
        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={2} placeholder="Any notes about this delivery (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};