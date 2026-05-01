import { axiosInstance } from '../../../lib/axios';
import type { PageResponse } from '../../../types/common.types';
import type { CreateReturnRequest, ReturnResponse, ReturnSummaryResponse } from '../../../types/return.types';

const base = (storeId: string) => `/stores/${storeId}/returns`;

export const createReturn = async (storeId: string, request: CreateReturnRequest): Promise<ReturnResponse> => {
  const { data } = await axiosInstance.post<ReturnResponse>(base(storeId), request);
  return data;
};

export const getReturns = async (storeId: string, page: number, size: number): Promise<PageResponse<ReturnSummaryResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<ReturnSummaryResponse>>(base(storeId), { params: { page, size } });
  return data;
};

export const getReturn = async (storeId: string, returnId: string): Promise<ReturnResponse> => {
  const { data } = await axiosInstance.get<ReturnResponse>(`${base(storeId)}/${returnId}`);
  return data;
};