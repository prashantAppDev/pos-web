import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSale, getSale, getSales } from '../api/sale.api';
import { QUERY_KEYS } from '../../../config/constants';
import type { CreateSaleRequest, SaleListParams } from '../../../types/sale.types';

export const useSaleList = (storeId: string, params: SaleListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.sales, storeId, params],
    queryFn: () => getSales(storeId, params),
    enabled: !!storeId,
  });

export const useSale = (storeId: string, saleId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.sale, storeId, saleId],
    queryFn: () => getSale(storeId, saleId),
    enabled: !!storeId && !!saleId,
  });

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, request }: { storeId: string; request: CreateSaleRequest }) =>
      createSale(storeId, request),
    onSuccess: (_data, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sales, storeId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stock, storeId] });
    },
  });
};