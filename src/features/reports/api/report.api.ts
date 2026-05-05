import { axiosInstance } from '../../../lib/axios';
import type {
  SalesReportParams,
  SalesReportResponse,
  TopProductsReportParams,
  TopProductsReportResponse,
} from '../../../types/report.types';

const base = (storeId: string) => `/stores/${storeId}/reports`;

export const getSalesReport = async (
  storeId: string,
  params: SalesReportParams
): Promise<SalesReportResponse> => {
  const { data } = await axiosInstance.get<SalesReportResponse>(`${base(storeId)}/sales`, { params });
  return data;
};

export const getTopProductsReport = async (
  storeId: string,
  params: TopProductsReportParams
): Promise<TopProductsReportResponse> => {
  const { data } = await axiosInstance.get<TopProductsReportResponse>(`${base(storeId)}/top-products`, { params });
  return data;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportSalesReport = async (
  storeId: string,
  params: SalesReportParams,
  format: 'pdf' | 'excel'
): Promise<void> => {
  const from = params.from;
  const to = params.to;
  const ext = format === 'pdf' ? 'pdf' : 'xlsx';
  const { data } = await axiosInstance.get<Blob>(`${base(storeId)}/sales`, {
    params: { ...params, export: format },
    responseType: 'blob',
  });
  downloadBlob(data, `sales_report_${from}_${to}.${ext}`);
};

export const exportTopProductsReport = async (
  storeId: string,
  params: TopProductsReportParams,
  format: 'pdf' | 'excel'
): Promise<void> => {
  const from = params.from;
  const to = params.to;
  const ext = format === 'pdf' ? 'pdf' : 'xlsx';
  const { data } = await axiosInstance.get<Blob>(`${base(storeId)}/top-products`, {
    params: { ...params, export: format },
    responseType: 'blob',
  });
  downloadBlob(data, `top_products_${from}_${to}.${ext}`);
};