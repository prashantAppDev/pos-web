import { axiosInstance } from '../../../lib/axios';
import type { PageResponse } from '../../../types/common.types';
import type {
  AddItemRequest, BatchResponse, CreateReceiptRequest,
  ReceiptImportResult, ReceiptListParams, ReceiptResponse,
  ReceiptSummaryResponse, StockLevelResponse, StockListParams,
  UpdateBatchPriceRequest, UpdateItemRequest,
} from '../../../types/inventory.types';
import type { MessageResponse } from '../../../types/common.types';

const base = (storeId: string) => `/stores/${storeId}/inventory`;

export const getReceipts = async (storeId: string, params: ReceiptListParams): Promise<PageResponse<ReceiptSummaryResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<ReceiptSummaryResponse>>(`${base(storeId)}/receipts`, { params });
  return data;
};

export const getReceipt = async (storeId: string, receiptId: string): Promise<ReceiptResponse> => {
  const { data } = await axiosInstance.get<ReceiptResponse>(`${base(storeId)}/receipts/${receiptId}`);
  return data;
};

export const createReceipt = async (storeId: string, request: CreateReceiptRequest): Promise<ReceiptResponse> => {
  const { data } = await axiosInstance.post<ReceiptResponse>(`${base(storeId)}/receipts`, request);
  return data;
};

export const confirmReceipt = async (storeId: string, receiptId: string): Promise<ReceiptResponse> => {
  const { data } = await axiosInstance.post<ReceiptResponse>(`${base(storeId)}/receipts/${receiptId}/confirm`);
  return data;
};

export const deleteReceipt = async (storeId: string, receiptId: string): Promise<MessageResponse> => {
  const { data } = await axiosInstance.delete<MessageResponse>(`${base(storeId)}/receipts/${receiptId}`);
  return data;
};

export const addItem = async (storeId: string, receiptId: string, request: AddItemRequest): Promise<ReceiptResponse> => {
  const { data } = await axiosInstance.post<ReceiptResponse>(`${base(storeId)}/receipts/${receiptId}/items`, request);
  return data;
};

export const updateItem = async (storeId: string, receiptId: string, itemId: string, request: UpdateItemRequest): Promise<ReceiptResponse> => {
  const { data } = await axiosInstance.patch<ReceiptResponse>(`${base(storeId)}/receipts/${receiptId}/items/${itemId}`, request);
  return data;
};

export const removeItem = async (storeId: string, receiptId: string, itemId: string): Promise<MessageResponse> => {
  const { data } = await axiosInstance.delete<MessageResponse>(`${base(storeId)}/receipts/${receiptId}/items/${itemId}`);
  return data;
};

export const importItems = async (storeId: string, receiptId: string, file: File): Promise<ReceiptImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axiosInstance.post<ReceiptImportResult>(
    `${base(storeId)}/receipts/${receiptId}/items/import`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const downloadReceiptTemplate = async (storeId: string): Promise<void> => {
  const response = await axiosInstance.get(`${base(storeId)}/receipts/import/template`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'goods_receipt_template.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const updateBatchPrice = async (storeId: string, batchId: string, request: UpdateBatchPriceRequest): Promise<BatchResponse> => {
  const { data } = await axiosInstance.patch<BatchResponse>(`${base(storeId)}/batches/${batchId}/price`, request);
  return data;
};

export const getStockLevels = async (storeId: string, params: StockListParams): Promise<PageResponse<StockLevelResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<StockLevelResponse>>(`${base(storeId)}/stock`, { params });
  return data;
};

export const getProductBatches = async (storeId: string, productId: string): Promise<BatchResponse[]> => {
  const { data } = await axiosInstance.get<BatchResponse[]>(`${base(storeId)}/stock/${productId}/batches`);
  return data;
};