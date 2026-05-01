import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addItem, confirmReceipt, createReceipt, deleteReceipt,
  getReceipt, getReceipts, getProductBatches, getStockLevels,
  importItems, removeItem, updateItem,
} from '../api/inventory.api';
import { QUERY_KEYS } from '../../../config/constants';
import type {
  AddItemRequest, CreateReceiptRequest, ReceiptListParams, StockListParams, UpdateItemRequest,
} from '../../../types/inventory.types';

export const useReceiptList = (storeId: string, params: ReceiptListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.receipts, storeId, params],
    queryFn: () => getReceipts(storeId, params),
    enabled: !!storeId,
  });

export const useReceipt = (storeId: string, receiptId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.receipt, storeId, receiptId],
    queryFn: () => getReceipt(storeId, receiptId),
    enabled: !!storeId && !!receiptId,
  });

export const useCreateReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, request }: { storeId: string; request: CreateReceiptRequest }) =>
      createReceipt(storeId, request),
    onSuccess: (_data, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.receipts, storeId] });
    },
  });
};

export const useConfirmReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, receiptId }: { storeId: string; receiptId: string }) =>
      confirmReceipt(storeId, receiptId),
    onSuccess: (_data, { storeId, receiptId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.receipts, storeId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.receipt, storeId, receiptId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stock, storeId] });
    },
  });
};

export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, receiptId }: { storeId: string; receiptId: string }) =>
      deleteReceipt(storeId, receiptId),
    onSuccess: (_data, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.receipts, storeId] });
    },
  });
};

export const useAddItem = (storeId: string, receiptId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AddItemRequest) => addItem(storeId, receiptId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.receipt, storeId, receiptId] });
    },
  });
};

export const useUpdateItem = (storeId: string, receiptId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, request }: { itemId: string; request: UpdateItemRequest }) =>
      updateItem(storeId, receiptId, itemId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.receipt, storeId, receiptId] });
    },
  });
};

export const useRemoveItem = (storeId: string, receiptId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeItem(storeId, receiptId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.receipt, storeId, receiptId] });
    },
  });
};

export const useImportItems = (storeId: string, receiptId: string) =>
  useMutation({
    mutationFn: (file: File) => importItems(storeId, receiptId, file),
  });

export const useStockLevels = (storeId: string, params: StockListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.stock, storeId, params],
    queryFn: () => getStockLevels(storeId, params),
    enabled: !!storeId,
  });

export const useProductBatches = (storeId: string, productId: string | null) =>
  useQuery({
    queryKey: [QUERY_KEYS.batches, storeId, productId],
    queryFn: () => getProductBatches(storeId, productId!),
    enabled: !!storeId && !!productId,
  });