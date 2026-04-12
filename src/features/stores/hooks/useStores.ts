import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStore, deleteStore, getStore, getStores, toggleStoreStatus, updateStore } from '../api/store.api';
import { QUERY_KEYS } from '../../../config/constants';
import type { CreateStoreRequest, StoreListParams, UpdateStoreRequest } from '../../../types/store.types';

export const useStoreList = (params: StoreListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.stores, params],
    queryFn: () => getStores(params),
  });

export const useStore = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.store, id],
    queryFn: () => getStore(id),
    enabled: !!id,
  });

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateStoreRequest) => createStore(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stores] }),
  });
};

export const useUpdateStore = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateStoreRequest) => updateStore(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stores] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.store, id] });
    },
  });
};

export const useToggleStoreStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleStoreStatus(id, isActive),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stores] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.store, id] });
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stores] }),
  });
};