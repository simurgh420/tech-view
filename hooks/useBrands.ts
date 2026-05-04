// hooks/useBrands.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchBrandBySlugApi, fetchBrandsApi } from '@/services/brands/api/queries';
import {
  createBrandRequestApi,
  deleteBrandRequestApi,
  updateBrandRequestApi,
} from '@/services/brands/api/mutations';
import { Brand } from '@/app/generated/prisma/client';
import { CreateBrandInput, EditBrandInput } from '@/lib/validation/brand';

export function useBrands() {
  const qc = useQueryClient();

  const useGetBrands = () => useQuery<Brand[]>({ queryKey: ['brands'], queryFn: fetchBrandsApi });

  const useGetBrand = (slug: string) =>
    useQuery<Brand>({
      queryKey: ['brand', slug],
      queryFn: () => fetchBrandBySlugApi(slug),
      enabled: !!slug,
    });

  const useCreateBrand = () =>
    useMutation<Brand, Error, CreateBrandInput>({
      mutationFn: payload => createBrandRequestApi(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['brands'] }),
    });

  const useUpdateBrand = () =>
    useMutation<Brand, Error, { slug: string; data: EditBrandInput }>({
      mutationFn: ({ slug, data }) => updateBrandRequestApi(slug, data),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: ['brands'] });
        qc.invalidateQueries({ queryKey: ['brand', vars.slug] });
      },
    });

  const useDeleteBrand = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: slug => deleteBrandRequestApi(slug),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['brands'] }),
    });

  return { useGetBrands, useGetBrand, useCreateBrand, useUpdateBrand, useDeleteBrand };
}
