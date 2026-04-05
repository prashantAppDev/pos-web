import { axiosInstance } from '../../../lib/axios';
import type {
  CreateTenantRequest,
  TenantListParams,
  TenantResponse,
  UpdateTenantRequest,
} from '../../../types/tenant.types';
import type { MessageResponse, PageResponse } from '../../../types/common.types';

export const getTenants = async (params: TenantListParams): Promise<PageResponse<TenantResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<TenantResponse>>('/super-admin/tenants', { params });
  return data;
};

export const getTenant = async (id: string): Promise<TenantResponse> => {
  const { data } = await axiosInstance.get<TenantResponse>(`/super-admin/tenants/${id}`);
  return data;
};

export const createTenant = async (request: CreateTenantRequest): Promise<TenantResponse> => {
  const { data } = await axiosInstance.post<TenantResponse>('/super-admin/tenants', request);
  return data;
};

export const updateTenant = async (id: string, request: UpdateTenantRequest): Promise<TenantResponse> => {
  const { data } = await axiosInstance.patch<TenantResponse>(`/super-admin/tenants/${id}`, request);
  return data;
};

export const toggleTenantStatus = async (id: string, isActive: boolean): Promise<MessageResponse> => {
  const { data } = await axiosInstance.patch<MessageResponse>(`/super-admin/tenants/${id}/status`, null, {
    params: { isActive },
  });
  return data;
};

export const deleteTenant = async (id: string): Promise<MessageResponse> => {
  const { data } = await axiosInstance.delete<MessageResponse>(`/super-admin/tenants/${id}`);
  return data;
};