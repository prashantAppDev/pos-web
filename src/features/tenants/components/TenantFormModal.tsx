import { useEffect } from 'react';
import { Form, Input, Modal, notification } from 'antd';
import { useCreateTenant, useUpdateTenant } from '../hooks/useTenants';
import type { TenantResponse } from '../../../types/tenant.types';

interface Props {
  open: boolean;
  onClose: () => void;
  tenant?: TenantResponse; // provided → edit mode, absent → create mode
}

export const TenantFormModal = ({ open, onClose, tenant }: Props) => {
  const [form] = Form.useForm();
  const isEdit = !!tenant;

  const { mutate: create, isPending: creating } = useCreateTenant();
  const { mutate: update, isPending: updating } = useUpdateTenant(tenant?.id ?? '');

  const isPending = creating || updating;

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        isEdit
          ? { name: tenant.name, email: tenant.email, phone: tenant.phone, address: tenant.address, gstNumber: tenant.gstNumber }
          : {}
      );
    } else {
      form.resetFields();
    }
  }, [open, tenant, isEdit, form]);

  const onError = (error: unknown) => {
    const message = (error as any)?.response?.data?.message;
    notification.error({
      message: isEdit ? 'Failed to update tenant' : 'Failed to create tenant',
      description: message || 'An unexpected error occurred',
    });
  };

  const onFinish = (values: Record<string, string>) => {
    const payload = {
      ...values,
      gstNumber: values.gstNumber ? values.gstNumber.toUpperCase() : undefined,
    };

    if (isEdit) {
      update(payload, { onSuccess: onClose, onError });
    } else {
      create(payload as any, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Tenant' : 'Create Tenant'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 16 }}
        requiredMark={false}
      >
        <Form.Item
          label="Business Name"
          name="name"
          rules={[{ required: true, message: 'Business name is required' }]}
        >
          <Input placeholder="e.g. Fresh Mart Grocery" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input placeholder="contact@freshmart.com" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: 'Phone is required' },
            { pattern: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number' },
          ]}
        >
          <Input placeholder="9876543210" maxLength={10} />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Address is required' }]}
        >
          <Input.TextArea rows={2} placeholder="Shop address" />
        </Form.Item>

        <Form.Item
          label="GST Number"
          name="gstNumber"
          rules={[
            {
              pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
              message: 'Enter a valid 15-character GST number',
            },
          ]}
        >
          <Input placeholder="22AAAAA0000A1Z5 (optional)" maxLength={15} style={{ textTransform: 'uppercase' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};