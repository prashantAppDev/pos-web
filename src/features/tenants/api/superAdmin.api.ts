import { axiosInstance } from '../../../lib/axios';
import type { StoreListParams, StoreResponse, CounterListParams, CounterResponse } from '../../../types/store.types';
import type { PageResponse } from '../../../types/common.types';

export const getSuperAdminStores = async (tenantId: string, params: StoreListParams): Promise<PageResponse<StoreResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<StoreResponse>>(
    `/super-admin/tenants/${tenantId}/stores`,
    { params }
  );
  return data;
};

export const getSuperAdminStore = async (tenantId: string, storeId: string): Promise<StoreResponse> => {
  const { data } = await axiosInstance.get<StoreResponse>(
    `/super-admin/tenants/${tenantId}/stores/${storeId}`
  );
  return data;
};

export const getSuperAdminCounters = async (tenantId: string, storeId: string, params: CounterListParams): Promise<PageResponse<CounterResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<CounterResponse>>(
    `/super-admin/tenants/${tenantId}/stores/${storeId}/counters`,
    { params }
  );
  return data;
};
