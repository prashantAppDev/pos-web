import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, notification, Typography } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { useCreateTenant, useUpdateTenant } from '../hooks/useTenants';
import type {
  TenantCreatedResponse,
  TenantResponse,
  CreateTenantRequest,
  UpdateTenantRequest,
} from '../../../types/tenant.types';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  tenant?: TenantResponse; // provided → edit mode, absent → create mode
}

export const TenantFormModal = ({ open, onClose, tenant }: Props) => {
  const [form] = Form.useForm();
  const isEdit = !!tenant;
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: create, isPending: creating } = useCreateTenant();
  const { mutate: update, isPending: updating } = useUpdateTenant(
    tenant?.id ?? '',
  );

  const isPending = creating || updating;

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        isEdit
          ? {
              name: tenant.name,
              email: tenant.email,
              phone: tenant.phone,
              address: tenant.address,
              gstNumber: tenant.gstNumber,
            }
          : {},
      );
    } else {
      form.resetFields();
    }
  }, [open, tenant, isEdit, form]);

  const handleClose = () => {
    setInviteLink(null);
    setCopied(false);
    onClose();
  };

  const onError = (error: unknown) => {
    const message = (error as AxiosError<{ message: string }>)?.response?.data
      ?.message;
    notification.error({
      message: isEdit ? 'Failed to update tenant' : 'Failed to create tenant',
      description: message || 'An unexpected error occurred',
    });
  };

  const onFinish = (values: Record<string, string>) => {
    if (isEdit) {
      const payload: UpdateTenantRequest = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        gstNumber: values.gstNumber
          ? values.gstNumber.toUpperCase()
          : undefined,
      };
      update(payload, { onSuccess: handleClose, onError });
    } else {
      const payload: CreateTenantRequest = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        gstNumber: values.gstNumber
          ? values.gstNumber.toUpperCase()
          : undefined,
      };
      create(payload, {
        onSuccess: (data: TenantCreatedResponse) =>
          setInviteLink(data.inviteLink),
        onError,
      });
    }
  };

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Invite link screen (shown after successful creation) ──
  if (inviteLink) {
    return (
      <Modal
        title="Tenant Created"
        open={open}
        onCancel={handleClose}
        footer={
          <Button type="primary" onClick={handleClose}>
            Done
          </Button>
        }
      >
        <div style={styles.inviteContainer}>
          <Text type="secondary" style={{ marginBottom: 12, display: 'block' }}>
            Share this invite link with the tenant admin. It expires in 7 days.
          </Text>
          <div style={styles.linkRow}>
            <Text style={styles.linkText} ellipsis>
              {inviteLink}
            </Text>
            <Button
              icon={copied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={handleCopy}
              type={copied ? 'default' : 'primary'}
              size="small"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={isEdit ? 'Edit Tenant' : 'Create Tenant'}
      open={open}
      onCancel={handleClose}
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
            {
              pattern: /^[0-9]{10}$/,
              message: 'Enter a valid 10-digit number',
            },
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
              pattern:
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
              message: 'Enter a valid 15-character GST number',
            },
          ]}
        >
          <Input
            placeholder="22AAAAA0000A1Z5 (optional)"
            maxLength={15}
            style={{ textTransform: 'uppercase' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const styles = {
  inviteContainer: {
    padding: '8px 0',
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#f5f5f5',
    borderRadius: 6,
    padding: '8px 12px',
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    minWidth: 0,
  },
};
