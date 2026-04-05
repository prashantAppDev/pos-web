import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTenant,
  deleteTenant,
  getTenant,
  getTenants,
  toggleTenantStatus,
  updateTenant,
} from '../api/tenant.api';
import { QUERY_KEYS } from '../../../config/constants';
import type { CreateTenantRequest, TenantListParams, UpdateTenantRequest } from '../../../types/tenant.types';

export const useTenantList = (params: TenantListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.tenants, params],
    queryFn: () => getTenants(params),
  });

export const useTenant = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.tenant, id],
    queryFn: () => getTenant(id),
    enabled: !!id,
  });

export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateTenantRequest) => createTenant(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tenants] }),
  });
};

export const useUpdateTenant = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateTenantRequest) => updateTenant(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tenants] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tenant, id] });
    },
  });
};

export const useToggleTenantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleTenantStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tenants] }),
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tenants] }),
  });
};