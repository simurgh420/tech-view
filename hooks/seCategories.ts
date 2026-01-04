// hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Category, CategoryPayload } from '@/types/category';
import { fetchCategories, fetchCategoryBySlug } from '@/services/categories/api/queries';
import {
  createCategoryRequest,
  deleteCategoryRequest,
  updateCategoryRequest,
} from '@/services/categories/api/mutations';

export function useCategories() {
  const queryClient = useQueryClient();

  const useGetCategories = () =>
    useQuery<Category[]>({
      queryKey: ['categories'],
      queryFn: fetchCategories,
    });

  const useGetCategory = (slug: string) =>
    useQuery<Category>({
      queryKey: ['category', slug],
      queryFn: () => fetchCategoryBySlug(slug),
      enabled: !!slug,
    });

  const useCreateCategory = () =>
    useMutation<Category, Error, CategoryPayload>({
      mutationFn: payload => createCategoryRequest(payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    });

  const useUpdateCategory = () =>
    useMutation<Category, Error, { slug: string; data: Partial<CategoryPayload> }>({
      mutationFn: ({ slug, data }) => updateCategoryRequest(slug, data),
      onSuccess: (_res, vars) => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['category', vars.slug] });
      },
    });

  const useDeleteCategory = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: slug => deleteCategoryRequest(slug),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    });

  return {
    useGetCategories,
    useGetCategory,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
  };
}
