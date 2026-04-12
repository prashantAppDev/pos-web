import { useEffect } from 'react';
import { Form, Input, Modal, notification } from 'antd';
import type { AxiosError } from 'axios';
import { useCreateCounter, useUpdateCounter } from '../hooks/useCounters';
import type { CounterResponse, CreateCounterRequest, UpdateCounterRequest } from '../../../types/store.types';

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: string;
  counter?: CounterResponse;
}

export const CounterFormModal = ({ open, onClose, storeId, counter }: Props) => {
  const [form] = Form.useForm();
  const isEdit = !!counter;

  const { mutate: create, isPending: creating } = useCreateCounter(storeId);
  const { mutate: update, isPending: updating } = useUpdateCounter(storeId, counter?.id ?? '');

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        isEdit
          ? { name: counter.name, deviceId: counter.deviceId ?? '' }
          : {}
      );
    } else {
      form.resetFields();
    }
  }, [open, counter, isEdit, form]);

  const onError = (error: unknown) => {
    const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
    notification.error({
      message: isEdit ? 'Failed to update counter' : 'Failed to create counter',
      description: message || 'An unexpected error occurred',
    });
  };

  const onFinish = (values: Record<string, string>) => {
    if (isEdit) {
      const payload: UpdateCounterRequest = {
        name: values.name,
        deviceId: values.deviceId || undefined,
      };
      update(payload, { onSuccess: onClose, onError });
    } else {
      const payload: CreateCounterRequest = {
        name: values.name,
        deviceId: values.deviceId || undefined,
      };
      create(payload, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Counter' : 'Add Counter'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Save' : 'Add'}
      confirmLoading={creating || updating}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }} requiredMark={false}>
        <Form.Item
          label="Counter Name"
          name="name"
          rules={[{ required: true, message: 'Counter name is required' }]}
        >
          <Input placeholder="e.g. Counter 1" />
        </Form.Item>

        <Form.Item label="Device ID" name="deviceId">
          <Input placeholder="Device identifier (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};