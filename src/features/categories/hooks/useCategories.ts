import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory, deleteCategory, getCategories, getCategory,
  toggleCategoryStatus, updateCategory,
} from '../api/category.api';
import { QUERY_KEYS } from '../../../config/constants';
import type { CategoryListParams, CreateCategoryRequest, UpdateCategoryRequest } from '../../../types/category.types';

export const useCategoryList = (params: CategoryListParams) =>
  useQuery({
    queryKey: [QUERY_KEYS.categories, params],
    queryFn: () => getCategories(params),
  });

export const useCategory = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.category, id],
    queryFn: () => getCategory(id),
    enabled: !!id,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateCategoryRequest) => createCategory(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] }),
  });
};

export const useUpdateCategory = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateCategoryRequest) => updateCategory(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.category, id] });
    },
  });
};

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleCategoryStatus(id, isActive),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.category, id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] }),
  });
};