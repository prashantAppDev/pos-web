import { Tag } from 'antd';

interface Props {
  isActive: boolean;
}

export const TenantStatusBadge = ({ isActive }: Props) => (
  <Tag color={isActive ? 'success' : 'default'}>
    {isActive ? 'Active' : 'Inactive'}
  </Tag>
);