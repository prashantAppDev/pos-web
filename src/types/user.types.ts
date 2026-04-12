export type StaffRole = 'MANAGER' | 'CASHIER';

export interface StaffUserResponse {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  storeId: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InviteUserRequest {
  name: string;
  email: string;
  role: StaffRole;
  storeId: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: StaffRole;
  storeId?: string;
}

export interface InviteUserResponse {
  user: StaffUserResponse;
  inviteLink: string;
}

export interface UserListParams {
  page?: number;
  size?: number;
  search?: string;
  role?: StaffRole;
  isActive?: boolean;
  storeId?: string;
}