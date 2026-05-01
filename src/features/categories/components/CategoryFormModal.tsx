import { useEffect } from 'react';
import { Form, Input, Modal, notification } from 'antd';
import type { AxiosError } from 'axios';
import { useCreateCategory, useUpdateCategory } from '../hooks/useCategories';
import type { CategoryResponse } from '../../../types/category.types';

interface Props {
  open: boolean;
  onClose: () => void;
  category?: CategoryResponse;
}

export const CategoryFormModal = ({ open, onClose, category }: Props) => {
  const [form] = Form.useForm();
  const isEdit = !!category;

  const { mutate: create, isPending: creating } = useCreateCategory();
  const { mutate: update, isPending: updating } = useUpdateCategory(category?.id ?? '');

  useEffect(() => {
    if (open) {
      form.setFieldsValue(isEdit ? { name: category.name } : {});
    } else {
      form.resetFields();
    }
  }, [open, category, isEdit, form]);

  const onError = (error: unknown) => {
    const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
    notification.error({
      message: isEdit ? 'Failed to update category' : 'Failed to create category',
      description: message || 'An unexpected error occurred',
    });
  };

  const onFinish = (values: { name: string }) => {
    if (isEdit) {
      update({ name: values.name }, { onSuccess: onClose, onError });
    } else {
      create({ name: values.name }, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Category' : 'Create Category'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={creating || updating}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }} requiredMark={false}>
        <Form.Item
          label="Category Name"
          name="name"
          rules={[{ required: true, message: 'Category name is required' }]}
        >
          <Input placeholder="e.g. Beverages" />
        </Form.Item>
      </Form>
    </Modal>
  );
};