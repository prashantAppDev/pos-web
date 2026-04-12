import { axiosInstance } from '../../../lib/axios';
import type {
  CreateStoreRequest,
  StoreListParams,
  StoreResponse,
  UpdateStoreRequest,
} from '../../../types/store.types';
import type { MessageResponse, PageResponse } from '../../../types/common.types';

export const getStores = async (params: StoreListParams): Promise<PageResponse<StoreResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<StoreResponse>>('/stores', { params });
  return data;
};

export const getStore = async (id: string): Promise<StoreResponse> => {
  const { data } = await axiosInstance.get<StoreResponse>(`/stores/${id}`);
  return data;
};

export const createStore = async (request: CreateStoreRequest): Promise<StoreResponse> => {
  const { data } = await axiosInstance.post<StoreResponse>('/stores', request);
  return data;
};

export const updateStore = async (id: string, request: UpdateStoreRequest): Promise<StoreResponse> => {
  const { data } = await axiosInstance.patch<StoreResponse>(`/stores/${id}`, request);
  return data;
};

export const toggleStoreStatus = async (id: string, isActive: boolean): Promise<MessageResponse> => {
  const { data } = await axiosInstance.patch<MessageResponse>(`/stores/${id}/status`, null, {
    params: { isActive },
  });
  return data;
};

export const deleteStore = async (id: string): Promise<MessageResponse> => {
  const { data } = await axiosInstance.delete<MessageResponse>(`/stores/${id}`);
  return data;
};