import { useState } from 'react';
import { Button, Input, notification, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, PauseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { useCategoryList, useDeleteCategory, useToggleCategoryStatus } from '../hooks/useCategories';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { PAGE_SIZE_DEFAULT } from '../../../config/constants';
import type { CategoryResponse } from '../../../types/category.types';

const { Title } = Typography;
const { Search } = Input;

export const CategoryListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | undefined>();

  const { data, isLoading } = useCategoryList({
    page: page - 1,
    size: PAGE_SIZE_DEFAULT,
    search: search || undefined,
    isActive,
  });

  const { mutate: toggleStatus } = useToggleCategoryStatus();
  const { mutate: deleteCategory } = useDeleteCategory();

  const openCreate = () => { setEditingCategory(undefined); setModalOpen(true); };
  const openEdit = (category: CategoryResponse) => { setEditingCategory(category); setModalOpen(true); };

  const handleToggleStatus = (category: CategoryResponse) => {
    toggleStatus(
      { id: category.id, isActive: !category.isActive },
      {
        onError: (error: unknown) => {
          const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
          notification.error({ message: 'Failed to update status', description: message });
        },
      }
    );
  };

  const handleDelete = (category: CategoryResponse) => {
    deleteCategory(category.id, {
      onError: (error: unknown) => {
        const message = (error as AxiosError<{ message: string }>)?.response?.data?.message;
        notification.error({ message: 'Failed to delete category', description: message });
      },
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 110,
      render: (active: boolean) =>
        active
          ? <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
          : <Tag icon={<PauseCircleOutlined />} color="default">Inactive</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      width: 130,
      render: (date: string) => new Date(date).toLocaleDateString('en-IN'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_: unknown, record: CategoryResponse) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm
            title={record.isActive ? 'Deactivate this category?' : 'Activate this category?'}
            onConfirm={() => handleToggleStatus(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small">{record.isActive ? 'Deactivate' : 'Activate'}</Button>
          </Popconfirm>
          {!record.isActive && (
            <Popconfirm
              title="Delete this category? This cannot be undone."
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button size="small" danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={styles.header}>
        <Title level={4} style={{ margin: 0 }}>Categories</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Category</Button>
      </div>

      <div style={styles.filters}>
        <Space>
          <Search
            placeholder="Search categories"
            allowClear
            onSearch={(v) => { setSearch(v); setPage(1); }}
            onChange={(e) => !e.target.value && setSearch('')}
            style={{ width: 260 }}
          />
          <Select
            defaultValue="all"
            onChange={(v) => { setIsActive(v === 'all' ? undefined : v === 'active'); setPage(1); }}
            style={{ width: 150 }}
            options={[
              { label: 'All Categories', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.content}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE_DEFAULT,
          total: data?.totalElements ?? 0,
          onChange: setPage,
          showTotal: (total) => `${total} categories`,
          showSizeChanger: false,
        }}
      />

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
      />
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filters: { marginBottom: 16 },
};