import { axiosInstance } from '../../../lib/axios';
import type {
  InviteUserRequest,
  InviteUserResponse,
  StaffUserResponse,
  UpdateUserRequest,
  UserListParams,
} from '../../../types/user.types';
import type { MessageResponse, PageResponse } from '../../../types/common.types';

export const getUsers = async (params: UserListParams): Promise<PageResponse<StaffUserResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<StaffUserResponse>>('/users', { params });
  return data;
};

export const getUser = async (id: string): Promise<StaffUserResponse> => {
  const { data } = await axiosInstance.get<StaffUserResponse>(`/users/${id}`);
  return data;
};

export const inviteUser = async (request: InviteUserRequest): Promise<InviteUserResponse> => {
  const { data } = await axiosInstance.post<InviteUserResponse>('/users/invite', request);
  return data;
};

export const updateUser = async (id: string, request: UpdateUserRequest): Promise<StaffUserResponse> => {
  const { data } = await axiosInstance.patch<StaffUserResponse>(`/users/${id}`, request);
  return data;
};

export const toggleUserStatus = async (id: string, isActive: boolean): Promise<MessageResponse> => {
  const { data } = await axiosInstance.patch<MessageResponse>(`/users/${id}/status`, null, {
    params: { isActive },
  });
  return data;
};

export const deleteUser = async (id: string): Promise<MessageResponse> => {
  const { data } = await axiosInstance.delete<MessageResponse>(`/users/${id}`);
  return data;
};