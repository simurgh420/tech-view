// hooks/useBrands.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBrandRequest,
  updateBrandRequest,
  deleteBrandRequest,
} from '@/services/brands/api/mutations';
import { Brand, BrandPayload } from '@/types/brand';
import { fetchBrandBySlug, fetchBrands } from '@/services/brands/api/queries';

export function useBrands() {
  const queryClient = useQueryClient();

  const useGetBrands = () => useQuery<Brand[]>({ queryKey: ['brands'], queryFn: fetchBrands });

  const useGetBrand = (slug: string) =>
    useQuery<Brand>({
      queryKey: ['brand', slug],
      queryFn: () => fetchBrandBySlug(slug),
      enabled: !!slug,
    });

  const useCreateBrand = () =>
    useMutation<Brand, Error, BrandPayload>({
      mutationFn: payload => createBrandRequest(payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
    });

  const useUpdateBrand = () =>
    useMutation<Brand, Error, { slug: string; data: Partial<BrandPayload> }>({
      mutationFn: ({ slug, data }) => updateBrandRequest(slug, data),
      onSuccess: (_res, vars) => {
        queryClient.invalidateQueries({ queryKey: ['brands'] });
        queryClient.invalidateQueries({ queryKey: ['brand', vars.slug] });
      },
    });

  const useDeleteBrand = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: slug => deleteBrandRequest(slug),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
    });

  return { useGetBrands, useGetBrand, useCreateBrand, useUpdateBrand, useDeleteBrand };
}
