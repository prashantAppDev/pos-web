import { axiosInstance } from '../../../lib/axios';
import type { CreateProductRequest, ProductImportResult, ProductListParams, ProductResponse, UpdateProductRequest } from '../../../types/product.types';
import type { MessageResponse, PageResponse } from '../../../types/common.types';

export const getProducts = async (params: ProductListParams): Promise<PageResponse<ProductResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<ProductResponse>>('/products', { params });
  return data;
};

export const getProduct = async (id: string): Promise<ProductResponse> => {
  const { data } = await axiosInstance.get<ProductResponse>(`/products/${id}`);
  return data;
};

export const createProduct = async (request: CreateProductRequest): Promise<ProductResponse> => {
  const { data } = await axiosInstance.post<ProductResponse>('/products', request);
  return data;
};

export const updateProduct = async (id: string, request: UpdateProductRequest): Promise<ProductResponse> => {
  const { data } = await axiosInstance.patch<ProductResponse>(`/products/${id}`, request);
  return data;
};

export const toggleProductStatus = async (id: string, isActive: boolean): Promise<MessageResponse> => {
  const { data } = await axiosInstance.patch<MessageResponse>(`/products/${id}/status`, null, {
    params: { isActive },
  });
  return data;
};

export const deleteProduct = async (id: string): Promise<MessageResponse> => {
  const { data } = await axiosInstance.delete<MessageResponse>(`/products/${id}`);
  return data;
};

export const searchProducts = async (q: string): Promise<ProductResponse[]> => {
  const { data } = await axiosInstance.get<ProductResponse[]>('/products/search', { params: { q } });
  return data;
};

export const importProducts = async (file: File): Promise<ProductImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axiosInstance.post<ProductImportResult>('/products/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const downloadProductTemplate = async (): Promise<void> => {
  const response = await axiosInstance.get('/products/import/template', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'product_import_template.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};