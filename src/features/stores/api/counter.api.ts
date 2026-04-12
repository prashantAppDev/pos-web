import { axiosInstance } from '../../../lib/axios';
import type {
  CounterListParams,
  CounterResponse,
  CreateCounterRequest,
  UpdateCounterRequest,
} from '../../../types/store.types';
import type { MessageResponse, PageResponse } from '../../../types/common.types';

export const getCounters = async (storeId: string, params: CounterListParams): Promise<PageResponse<CounterResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<CounterResponse>>(`/stores/${storeId}/counters`, { params });
  return data;
};

export const getCounter = async (storeId: string, id: string): Promise<CounterResponse> => {
  const { data } = await axiosInstance.get<CounterResponse>(`/stores/${storeId}/counters/${id}`);
  return data;
};

export const createCounter = async (storeId: string, request: CreateCounterRequest): Promise<CounterResponse> => {
  const { data } = await axiosInstance.post<CounterResponse>(`/stores/${storeId}/counters`, request);
  return data;
};

export const updateCounter = async (storeId: string, id: string, request: UpdateCounterRequest): Promise<CounterResponse> => {
  const { data } = await axiosInstance.patch<CounterResponse>(`/stores/${storeId}/counters/${id}`, request);
  return data;
};

export const toggleCounterStatus = async (storeId: string, id: string, isActive: boolean): Promise<MessageResponse> => {
  const { data } = await axiosInstance.patch<MessageResponse>(`/stores/${storeId}/counters/${id}/status`, null, {
    params: { isActive },
  });
  return data;
};

export const deleteCounter = async (storeId: string, id: string): Promise<MessageResponse> => {
  const { data } = await axiosInstance.delete<MessageResponse>(`/stores/${storeId}/counters/${id}`);
  return data;
};