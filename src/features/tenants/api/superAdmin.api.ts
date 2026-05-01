import { axiosInstance } from '../../../lib/axios';
import type { StoreListParams, StoreResponse, CounterListParams, CounterResponse } from '../../../types/store.types';
import type { PageResponse } from '../../../types/common.types';
import type { StaffUserResponse, UserListParams } from '../../../types/user.types';
import type { CategoryResponse, CategoryListParams } from '../../../types/category.types';
import type { ProductResponse, ProductListParams } from '../../../types/product.types';

export const getTenantStores = async (tenantId: string, params: StoreListParams): Promise<PageResponse<StoreResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<StoreResponse>>(
    `/super-admin/tenants/${tenantId}/stores`,
    { params }
  );
  return data;
};

export const getTenantStore = async (tenantId: string, storeId: string): Promise<StoreResponse> => {
  const { data } = await axiosInstance.get<StoreResponse>(
    `/super-admin/tenants/${tenantId}/stores/${storeId}`
  );
  return data;
};

export const getTenantCounters = async (tenantId: string, storeId: string, params: CounterListParams): Promise<PageResponse<CounterResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<CounterResponse>>(
    `/super-admin/tenants/${tenantId}/stores/${storeId}/counters`,
    { params }
  );
  return data;
};

export const getTenantUsers = async (tenantId: string, params: UserListParams): Promise<PageResponse<StaffUserResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<StaffUserResponse>>(
    `/super-admin/tenants/${tenantId}/users`,
    { params }
  );
  return data;
};

export const getTenantUser = async (tenantId: string, userId: string): Promise<StaffUserResponse> => {
  const { data } = await axiosInstance.get<StaffUserResponse>(
    `/super-admin/tenants/${tenantId}/users/${userId}`
  );
  return data;
};

export const getTenantCounter = async (tenantId: string, storeId: string, counterId: string): Promise<CounterResponse> => {
  const { data } = await axiosInstance.get<CounterResponse>(
    `/super-admin/tenants/${tenantId}/stores/${storeId}/counters/${counterId}`
  );
  return data;
};

export const getTenantCategories = async (tenantId: string, params: CategoryListParams): Promise<PageResponse<CategoryResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<CategoryResponse>>(
    `/super-admin/tenants/${tenantId}/categories`,
    { params }
  );
  return data;
};

export const getTenantCategory = async (tenantId: string, categoryId: string): Promise<CategoryResponse> => {
  const { data } = await axiosInstance.get<CategoryResponse>(
    `/super-admin/tenants/${tenantId}/categories/${categoryId}`
  );
  return data;
};

export const getTenantProducts = async (tenantId: string, params: ProductListParams): Promise<PageResponse<ProductResponse>> => {
  const { data } = await axiosInstance.get<PageResponse<ProductResponse>>(
    `/super-admin/tenants/${tenantId}/products`,
    { params }
  );
  return data;
};

export const getTenantProduct = async (tenantId: string, productId: string): Promise<ProductResponse> => {
  const { data } = await axiosInstance.get<ProductResponse>(
    `/super-admin/tenants/${tenantId}/products/${productId}`
  );
  return data;
};
