import { useQuery } from '@tanstack/react-query';
import { getSuperAdminCounters, getSuperAdminStore, getSuperAdminStores } from '../api/superAdmin.api';
import { QUERY_KEYS } from '../../../config/constants';
import type { CounterListParams, StoreListParams } from '../../../types/store.types';

export const useSuperAdminStoreList = (tenantId: string, params: StoreListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.saStores, tenantId, params],
    queryFn: () => getSuperAdminStores(tenantId, params),
    enabled: !!tenantId,
  });

export const useSuperAdminStore = (tenantId: string, storeId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.saStore, tenantId, storeId],
    queryFn: () => getSuperAdminStore(tenantId, storeId),
    enabled: !!tenantId && !!storeId,
  });

export const useSuperAdminCounterList = (tenantId: string, storeId: string, params: CounterListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.saCounters, tenantId, storeId, params],
    queryFn: () => getSuperAdminCounters(tenantId, storeId, params),
    enabled: !!tenantId && !!storeId,
  });
