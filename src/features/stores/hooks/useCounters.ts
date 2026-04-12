import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCounter, deleteCounter, getCounter, getCounters, toggleCounterStatus, updateCounter } from '../api/counter.api';
import { QUERY_KEYS } from '../../../config/constants';
import type { CreateCounterRequest, CounterListParams, UpdateCounterRequest } from '../../../types/store.types';

export const useCounterList = (storeId: string, params: CounterListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.counters, storeId, params],
    queryFn: () => getCounters(storeId, params),
    enabled: !!storeId,
  });

export const useCounter = (storeId: string, id: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.counter, storeId, id],
    queryFn: () => getCounter(storeId, id),
    enabled: !!storeId && !!id,
  });

export const useCreateCounter = (storeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateCounterRequest) => createCounter(storeId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.counters, storeId] }),
  });
};

export const useUpdateCounter = (storeId: string, id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateCounterRequest) => updateCounter(storeId, id, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.counters, storeId] }),
  });
};

export const useToggleCounterStatus = (storeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleCounterStatus(storeId, id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.counters, storeId] }),
  });
};

export const useDeleteCounter = (storeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCounter(storeId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.counters, storeId] }),
  });
};