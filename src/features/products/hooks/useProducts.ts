import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct, deleteProduct, getProduct, getProducts,
  importProducts, toggleProductStatus, updateProduct,
} from '../api/product.api';
import { QUERY_KEYS } from '../../../config/constants';
import type { CreateProductRequest, ProductListParams, UpdateProductRequest } from '../../../types/product.types';

export const useProductList = (params: ProductListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.products, params],
    queryFn: () => getProducts(params),
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.product, id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateProductRequest) => createProduct(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.products] }),
  });
};

export const useUpdateProduct = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateProductRequest) => updateProduct(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.products] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.product, id] });
    },
  });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleProductStatus(id, isActive),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.products] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.product, id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.products] }),
  });
};

export const useImportProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importProducts(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.products] }),
  });
};