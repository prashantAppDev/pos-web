import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReturn, getReturn, getReturns } from '../api/return.api';
import { QUERY_KEYS } from '../../../config/constants';
import type { CreateReturnRequest } from '../../../types/return.types';

export const useReturnList = (storeId: string, page: number, size: number) =>
  useQuery({
    queryKey: [QUERY_KEYS.returns, storeId, page, size],
    queryFn: () => getReturns(storeId, page, size),
    enabled: !!storeId,
  });

export const useReturn = (storeId: string, returnId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.saleReturn, storeId, returnId],
    queryFn: () => getReturn(storeId, returnId),
    enabled: !!storeId && !!returnId,
  });

export const useCreateReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, request }: { storeId: string; request: CreateReturnRequest }) =>
      createReturn(storeId, request),
    onSuccess: (_data, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.returns, storeId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stock, storeId] });
    },
  });
};