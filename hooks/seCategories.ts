// hooks/useCategories.ts

import { fetchCategories, fetchCategoryBySlug } from '@/services/categories/api/queries';
import { Category, CategoryWithProducts } from '@/types/category';
import { useQuery } from '@tanstack/react-query';

export function useCategories() {
  const useGetCategories = () => {
    useQuery<Category[]>({
      queryKey: ['categories'],
      queryFn: fetchCategories,
      staleTime: 1000 * 60 * 5,
    });
  };
  const useGetCategoryBySlug = (slug: string) =>
    useQuery<CategoryWithProducts>({
      queryKey: ['category', slug],
      queryFn: () => fetchCategoryBySlug(slug),
      enabled: !!slug,
    });
  return { useGetCategories, useGetCategoryBySlug };
}
