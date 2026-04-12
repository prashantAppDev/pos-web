import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, notification, Select, Typography } from 'antd';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { useInviteUser } from '../hooks/useUsers';
import type { InviteUserResponse } from '../../../types/user.types';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
}

export const InviteUserModal = ({ open, onClose, storeId, storeName }: Props) => {
  const [form] = Form.useForm();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: invite, isPending } = useInviteUser();

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setInviteLink(null);
      setCopied(false);
    }
  }, [open, form]);

  const onFinish = (values: { name: string; email: string; role: 'MANAGER' | 'CASHIER' }) => {
    invite(
      { ...values, storeId },
      {
        onSuccess: (data: InviteUserResponse) => setInviteLink(data.inviteLink),
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({
            message: 'Failed to send invite',
            description: message || 'An unexpected error occurred',
          });
        },
      }
    );
  };

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (inviteLink) {
    return (
      <Modal
        title="Invite Sent"
        open={open}
        onCancel={onClose}
        footer={<Button type="primary" onClick={onClose}>Done</Button>}
      >
        <div style={styles.inviteContainer}>
          <Text type="secondary" style={{ marginBottom: 12, display: 'block' }}>
            Share this invite link with the staff member. It expires in 7 days.
          </Text>
          <div style={styles.linkRow}>
            <Text style={styles.linkText} ellipsis>{inviteLink}</Text>
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
      title="Invite Staff"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Generate Invite Link"
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }} requiredMark={false}>
        <Form.Item label="Store">
          <Input value={storeName} disabled />
        </Form.Item>

        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="e.g. Ravi Kumar" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input placeholder="ravi@example.com" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Role is required' }]}
        >
          <Select
            placeholder="Select role"
            options={[
              { label: 'Manager', value: 'MANAGER' },
              { label: 'Cashier', value: 'CASHIER' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const styles = {
  inviteContainer: { padding: '8px 0' },
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