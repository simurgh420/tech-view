import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchAdminAttributesApi,
  fetchCategoryAttributesApi,
} from '@/services/categories/api/queries';

import {
  addCategoryAttributeApi,
  deleteCategoryAttributeApi,
  reorderCategoryAttributesApi,
  updateCategoryAttributeApi,
} from '@/services/categories/api/mutations';
import { AdminAttribute, CategoryAttributeOption } from '@/types/category';

export const categoryAttributeKeys = {
  all: ['category-attributes'] as const,

  detail: (slug: string) => ['category-attributes', slug] as const,

  available: ['attributes'] as const,
};

export function useGetCategoryAttributes(categorySlug: string) {
  return useQuery<CategoryAttributeOption[]>({
    queryKey: categoryAttributeKeys.detail(categorySlug),
    queryFn: () => fetchCategoryAttributesApi(categorySlug),
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 10,
  });
}

export function useGetAdminAttributes() {
  return useQuery<AdminAttribute[]>({
    queryKey: categoryAttributeKeys.available,
    queryFn: fetchAdminAttributesApi,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAddCategoryAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCategoryAttributeApi,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryAttributeKeys.detail(variables.categorySlug),
      });
    },
  });
}

export function useUpdateCategoryAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategoryAttributeApi,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryAttributeKeys.detail(variables.categorySlug),
      });
    },
  });
}

export function useDeleteCategoryAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategoryAttributeApi,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryAttributeKeys.detail(variables.categorySlug),
      });
    },
  });
}

export function useReorderCategoryAttributes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderCategoryAttributesApi,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryAttributeKeys.detail(variables.categorySlug),
      });
    },
  });
}
