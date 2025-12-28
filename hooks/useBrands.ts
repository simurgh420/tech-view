// hooks/useBrands.ts

import { fetchBrandBySlug, fetchBrands } from '@/services/brands/api/queries';
import { Brand, BrandWithProducts } from '@/types/brand';
import { useQuery } from '@tanstack/react-query';

export function useBrands() {
  const useGetBrands = () =>
    useQuery<Brand[]>({
      queryKey: ['brands'],
      queryFn: fetchBrands,
      staleTime: 1000 * 60 * 5,
    });
  const useGetBrandBySlug = (slug: string) =>
    useQuery<BrandWithProducts>({
      queryKey: ['brand', slug],
      queryFn: () => fetchBrandBySlug(slug),
      enabled: !!slug,
    });
  return { useGetBrands, useGetBrandBySlug };
}
