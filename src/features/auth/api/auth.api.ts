import { axiosInstance } from '../../../lib/axios';
import type { AcceptInviteRequest, AuthResponse, LoginRequest, UserResponse } from '../../../types/auth.types';
import type { MessageResponse } from '../../../types/common.types';

export const login = async (request: LoginRequest): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>('/auth/login', request);
  return data;
};

// No body needed — browser sends the refreshToken HttpOnly cookie automatically
export const refresh = async (): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>('/auth/refresh');
  return data;
};

export const logout = async (): Promise<MessageResponse> => {
  const { data } = await axiosInstance.post<MessageResponse>('/auth/logout');
  return data;
};

export const acceptInvite = async (request: AcceptInviteRequest): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>('/auth/accept-invite', request);
  return data;
};

export const getMe = async (): Promise<UserResponse> => {
  const { data } = await axiosInstance.get<UserResponse>('/auth/me');
  return data;
};