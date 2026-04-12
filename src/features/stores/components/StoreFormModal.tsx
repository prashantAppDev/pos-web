import { useEffect } from 'react';
import { Form, Input, Modal, notification } from 'antd';
import type { AxiosError } from 'axios';
import { useCreateStore, useUpdateStore } from '../hooks/useStores';
import type { CreateStoreRequest, StoreResponse, UpdateStoreRequest } from '../../../types/store.types';

interface Props {
  open: boolean;
  onClose: () => void;
  store?: StoreResponse;
}

export const StoreFormModal = ({ open, onClose, store }: Props) => {
  const [form] = Form.useForm();
  const isEdit = !!store;

  const { mutate: create, isPending: creating } = useCreateStore();
  const { mutate: update, isPending: updating } = useUpdateStore(store?.id ?? '');

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        isEdit
          ? { name: store.name, address: store.address, phone: store.phone ?? '' }
          : {}
      );
    } else {
      form.resetFields();
    }
  }, [open, store, isEdit, form]);

  const onError = (error: unknown) => {
    const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
    notification.error({
      message: isEdit ? 'Failed to update store' : 'Failed to create store',
      description: message || 'An unexpected error occurred',
    });
  };

  const onFinish = (values: Record<string, string>) => {
    if (isEdit) {
      const payload: UpdateStoreRequest = {
        name: values.name,
        address: values.address,
        phone: values.phone || undefined,
      };
      update(payload, { onSuccess: onClose, onError });
    } else {
      const payload: CreateStoreRequest = {
        name: values.name,
        address: values.address,
        phone: values.phone || undefined,
      };
      create(payload, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Store' : 'Create Store'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={creating || updating}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }} requiredMark={false}>
        <Form.Item
          label="Store Name"
          name="name"
          rules={[{ required: true, message: 'Store name is required' }]}
        >
          <Input placeholder="e.g. MG Road Branch" />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Address is required' }]}
        >
          <Input.TextArea rows={2} placeholder="Store address" />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input placeholder="9876543210 (optional)" maxLength={10} />
        </Form.Item>
      </Form>
    </Modal>
  );
};