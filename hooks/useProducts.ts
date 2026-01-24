// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductPayload, Product } from '@/types/product';

import {
  createProductَApi,
  deleteProductApi,
  updateProductApi,
} from '@/services/products/api/mutations';
import {
  fetchFeaturedProductsApi,
  fetchProductBySlugApi,
  fetchProductsApi,
  fetchProductsByBrandApi,
  fetchProductsByCategoryApi,
} from '@/services/products/api/queries';

export function useProducts() {
  const qc = useQueryClient();

  const useGetProducts = () =>
    useQuery<Product[]>({
      queryKey: ['products'],
      queryFn: fetchProductsApi,
    });

  const useGetProduct = (slug: string) =>
    useQuery<Product>({
      queryKey: ['product', slug],
      queryFn: () => fetchProductBySlugApi(slug),
      enabled: !!slug,
    });

  const useCreateProduct = () =>
    useMutation<Product, Error, ProductPayload>({
      mutationFn: payload => createProductَApi(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    });

  const useUpdateProduct = () =>
    useMutation<Product, Error, { slug: string; data: Partial<ProductPayload> }>({
      mutationFn: ({ slug, data }) => updateProductApi(slug, data),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: ['products'] });
        qc.invalidateQueries({ queryKey: ['product', vars.slug] });
      },
    });

  const useDeleteProduct = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: slug => deleteProductApi(slug),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    });

  const useGetProductsByCategory = (slug: string) =>
    useQuery<Product[]>({
      queryKey: ['products', 'category', slug],
      queryFn: () => fetchProductsByCategoryApi(slug),
      enabled: !!slug,
    });

  const useGetProductsByBrand = (slug: string) =>
    useQuery<Product[]>({
      queryKey: ['products', 'brand', slug],
      queryFn: () => fetchProductsByBrandApi(slug),
      enabled: !!slug,
    });

  const useGetFeatured = () =>
    useQuery<Product[]>({
      queryKey: ['products', 'featured'],
      queryFn: fetchFeaturedProductsApi,
    });

  return {
    useGetProducts,
    useGetProduct,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    useGetProductsByCategory,
    useGetProductsByBrand,
    useGetFeatured,
  };
}
