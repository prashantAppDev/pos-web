import { axiosInstance } from '../../../lib/axios';
import type { PageResponse } from '../../../types/common.types';
import type { CreateSaleRequest, SaleListParams, SaleResponse, SaleSummaryResponse } from '../../../types/sale.types';

const base = (storeId: string) => `/stores/${storeId}/sales`;

export const createSale = async (storeId: string, request: CreateSaleRequest): Promise<SaleResponse> => {
  const { data } = await axiosInstance.post<SaleResponse>(base(storeId), request);
  return data;
};

export const getSales = async (storeId: string, params: SaleListParams): Promise<PageResponse<SaleSummaryResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<SaleSummaryResponse>>(base(storeId), { params });
  return data;
};

export const getSale = async (storeId: string, saleId: string): Promise<SaleResponse> => {
  const { data } = await axiosInstance.get<SaleResponse>(`${base(storeId)}/${saleId}`);
  return data;
};