import { useQuery } from '@tanstack/react-query';
import {
  getTenantCategories, getTenantCategory,
  getTenantCounter, getTenantCounters,
  getTenantProducts, getTenantProduct,
  getTenantStore, getTenantStores,
  getTenantUser, getTenantUsers,
} from '../api/superAdmin.api';
import { QUERY_KEYS } from '../../../config/constants';
import type { CounterListParams, StoreListParams } from '../../../types/store.types';
import type { UserListParams } from '../../../types/user.types';
import type { CategoryListParams } from '../../../types/category.types';
import type { ProductListParams } from '../../../types/product.types';

export const useSuperAdminStoreList = (tenantId: string, params: StoreListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.saStores, tenantId, params],
    queryFn: () => getTenantStores(tenantId, params),
    enabled: !!tenantId,
  });

export const useSuperAdminStore = (tenantId: string, storeId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.saStore, tenantId, storeId],
    queryFn: () => getTenantStore(tenantId, storeId),
    enabled: !!tenantId && !!storeId,
  });

export const useSuperAdminCounterList = (tenantId: string, storeId: string, params: CounterListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.saCounters, tenantId, storeId, params],
    queryFn: () => getTenantCounters(tenantId, storeId, params),
    enabled: !!tenantId && !!storeId,
  });

export const useSuperAdminUserList = (tenantId: string, params: UserListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.saUsers, tenantId, params],
    queryFn: () => getTenantUsers(tenantId, params),
    enabled: !!tenantId,
  });

export const useSuperAdminUser = (tenantId: string, userId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.saUser, tenantId, userId],
    queryFn: () => getTenantUser(tenantId, userId),
    enabled: !!tenantId && !!userId,
  });

export const useSuperAdminCounter = (tenantId: string, storeId: string, counterId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.saCounter, tenantId, storeId, counterId],
    queryFn: () => getTenantCounter(tenantId, storeId, counterId),
    enabled: !!tenantId && !!storeId && !!counterId,
  });

export const useSuperAdminCategoryList = (tenantId: string, params: CategoryListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.saCategories, tenantId, params],
    queryFn: () => getTenantCategories(tenantId, params),
    enabled: !!tenantId,
  });

export const useSuperAdminCategory = (tenantId: string, categoryId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.saCategory, tenantId, categoryId],
    queryFn: () => getTenantCategory(tenantId, categoryId),
    enabled: !!tenantId && !!categoryId,
  });

export const useSuperAdminProductList = (tenantId: string, params: ProductListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.saProducts, tenantId, params],
    queryFn: () => getTenantProducts(tenantId, params),
    enabled: !!tenantId,
  });

export const useSuperAdminProduct = (tenantId: string, productId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.saProduct, tenantId, productId],
    queryFn: () => getTenantProduct(tenantId, productId),
    enabled: !!tenantId && !!productId,
  });
