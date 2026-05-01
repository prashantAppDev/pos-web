import { axiosInstance } from '../../../lib/axios';
import type { CategoryListParams, CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../../../types/category.types';
import type { MessageResponse, PageResponse } from '../../../types/common.types';

export const getCategories = async (params: CategoryListParams): Promise<PageResponse<CategoryResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<CategoryResponse>>('/categories', { params });
  return data;
};

export const getCategory = async (id: string): Promise<CategoryResponse> => {
  const { data } = await axiosInstance.get<CategoryResponse>(`/categories/${id}`);
  return data;
};

export const createCategory = async (request: CreateCategoryRequest): Promise<CategoryResponse> => {
  const { data } = await axiosInstance.post<CategoryResponse>('/categories', request);
  return data;
};

export const updateCategory = async (id: string, request: UpdateCategoryRequest): Promise<CategoryResponse> => {
  const { data } = await axiosInstance.patch<CategoryResponse>(`/categories/${id}`, request);
  return data;
};

export const toggleCategoryStatus = async (id: string, isActive: boolean): Promise<MessageResponse> => {
  const { data } = await axiosInstance.patch<MessageResponse>(`/categories/${id}/status`, null, {
    params: { isActive },
  });
  return data;
};

export const deleteCategory = async (id: string): Promise<MessageResponse> => {
  const { data } = await axiosInstance.delete<MessageResponse>(`/categories/${id}`);
  return data;
};