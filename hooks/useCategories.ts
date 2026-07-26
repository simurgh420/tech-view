// hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCategoryRequestApi,
  deleteCategoryRequestApi,
  updateCategoryRequestApi,
} from '@/services/categories/api/mutations';
import { fetchCategoriesApi, fetchCategoryBySlugApi } from '@/services/categories/api/queries';
import { Category } from '@/app/generated/prisma/client';
import { CreateCategoryInput, EditCategoryInput } from '@/lib/validation/category';

/** کلیدهای کوئری متمرکز برای دسته‌بندی‌ها */
export const categoryKeys = {
  all: ['categories'] as const,
  detail: (slug: string) => ['category', slug] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** لیست کامل دسته‌بندی‌ها */
export function useGetCategories() {
  return useQuery<Category[]>({
    queryKey: categoryKeys.all,
    queryFn: fetchCategoriesApi,
  });
}

/** یک دسته‌بندی بر اساس اسلاگ */
export function useGetCategory(slug: string) {
  return useQuery<Category>({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => fetchCategoryBySlugApi(slug),
    enabled: !!slug,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** ایجاد دسته‌بندی جدید */
export function useCreateCategory() {
  const qc = useQueryClient();

  return useMutation<Category, Error, CreateCategoryInput>({
    mutationFn: createCategoryRequestApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

/** به‌روزرسانی دسته‌بندی */
export function useUpdateCategory() {
  const qc = useQueryClient();

  return useMutation<Category, Error, { slug: string; data: EditCategoryInput }>({
    mutationFn: ({ slug, data }) => updateCategoryRequestApi(slug, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      qc.invalidateQueries({ queryKey: categoryKeys.detail(vars.slug) });
    },
  });
}

/** حذف دسته‌بندی */
export function useDeleteCategory() {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteCategoryRequestApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
