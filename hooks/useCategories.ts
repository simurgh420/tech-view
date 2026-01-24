// hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Category, CategoryPayload } from '@/types/category';
import {
  createCategoryRequestApi,
  deleteCategoryRequestApi,
  updateCategoryRequestApi,
} from '@/services/categories/api/mutations';
import { fetchCategoriesApi, fetchCategoryBySlugApi } from '@/services/categories/api/queries';

export function useCategories() {
  const qc = useQueryClient();

  const useGetCategories = () =>
    useQuery<Category[]>({
      queryKey: ['categories'],
      queryFn: fetchCategoriesApi,
    });

  const useGetCategory = (slug: string) =>
    useQuery<Category>({
      queryKey: ['category', slug],
      queryFn: () => fetchCategoryBySlugApi(slug),
      enabled: !!slug,
    });

  const useCreateCategory = () =>
    useMutation<Category, Error, CategoryPayload>({
      mutationFn: payload => createCategoryRequestApi(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
    });

  const useUpdateCategory = () =>
    useMutation<Category, Error, { slug: string; data: Partial<CategoryPayload> }>({
      mutationFn: ({ slug, data }) => updateCategoryRequestApi(slug, data),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: ['categories'] });
        qc.invalidateQueries({ queryKey: ['category', vars.slug] });
      },
    });

  const useDeleteCategory = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: slug => deleteCategoryRequestApi(slug),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
    });

  return {
    useGetCategories,
    useGetCategory,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
  };
}
