// hooks/useBrands.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchBrandBySlugApi, fetchBrandsApi } from '@/services/brands/api/queries';
import {
  createBrandRequestApi,
  deleteBrandRequestApi,
  updateBrandRequestApi,
} from '@/services/brands/api/mutations';
import { Brand } from '@/app/generated/prisma/client';
import { CreateBrandInput, UpdateBrandInput } from '@/lib/validation/brand';

/** کلیدهای کوئری متمرکز برای برندها */
export const brandKeys = {
  all: ['brands'] as const,
  detail: (slug: string) => ['brand', slug] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** لیست کامل برندها */
export function useGetBrands() {
  return useQuery<Brand[]>({
    queryKey: brandKeys.all,
    queryFn: fetchBrandsApi,
  });
}

/** یک برند بر اساس اسلاگ */
export function useGetBrand(slug: string) {
  return useQuery<Brand>({
    queryKey: brandKeys.detail(slug),
    queryFn: () => fetchBrandBySlugApi(slug),
    enabled: !!slug,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** ایجاد برند جدید */
export function useCreateBrand() {
  const qc = useQueryClient();

  return useMutation<Brand, Error, CreateBrandInput>({
    mutationFn: payload => createBrandRequestApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}

/** به‌روزرسانی برند */
export function useUpdateBrand() {
  const qc = useQueryClient();

  return useMutation<Brand, Error, { slug: string; data: UpdateBrandInput }>({
    mutationFn: ({ slug, data }) => updateBrandRequestApi(slug, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: brandKeys.all });
      qc.invalidateQueries({ queryKey: brandKeys.detail(vars.slug) });
    },
  });
}

/** حذف برند */
export function useDeleteBrand() {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: slug => deleteBrandRequestApi(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}
