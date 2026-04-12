import { useEffect } from 'react';
import { Form, Input, Modal, notification, Select } from 'antd';
import type { AxiosError } from 'axios';
import { useUpdateUser } from '../hooks/useUsers';
import { useStoreList } from '../../stores/hooks/useStores';
import type { StaffUserResponse } from '../../../types/user.types';

interface Props {
  open: boolean;
  onClose: () => void;
  user: StaffUserResponse;
}

export const EditUserModal = ({ open, onClose, user }: Props) => {
  const [form] = Form.useForm();
  const { mutate: update, isPending } = useUpdateUser(user.id);

  const { data: storesData } = useStoreList({ size: 100, isActive: true });
  const storeOptions = storesData?.content.map((s) => ({ label: s.name, value: s.id })) ?? [];

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: user.name,
        role: user.role,
        storeId: user.storeId,
      });
    } else {
      form.resetFields();
    }
  }, [open, user, form]);

  const onFinish = (values: { name: string; role: 'MANAGER' | 'CASHIER'; storeId: string }) => {
    update(values, {
      onSuccess: onClose,
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({
          message: 'Failed to update user',
          description: message || 'An unexpected error occurred',
        });
      },
    });
  };

  return (
    <Modal
      title="Edit Staff"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Save"
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }} requiredMark={false}>
        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Role is required' }]}
        >
          <Select
            options={[
              { label: 'Manager', value: 'MANAGER' },
              { label: 'Cashier', value: 'CASHIER' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Assigned Store"
          name="storeId"
          rules={[{ required: true, message: 'Store is required' }]}
        >
          <Select
            showSearch
            placeholder="Select store"
            optionFilterProp="label"
            options={storeOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};