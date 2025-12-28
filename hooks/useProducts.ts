// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductPayload, Product } from '@/types/product';
import {
  fetchFeaturedProducts,
  fetchProductBySlug,
  fetchProducts,
  fetchProductsByBrand,
  fetchProductsByCategory,
} from '@/services/products/api/queries';
import { createProduct, deleteProduct, updateProduct } from '@/services/products/db/mutations';

export function useProducts() {
  const qc = useQueryClient();

  const useGetProducts = () =>
    useQuery<Product[]>({
      queryKey: ['products'],
      queryFn: fetchProducts,
    });

  const useGetProduct = (slug: string) =>
    useQuery<Product>({
      queryKey: ['product', slug],
      queryFn: () => fetchProductBySlug(slug),
      enabled: !!slug,
    });

  const useCreateProduct = () =>
    useMutation<Product, Error, ProductPayload>({
      mutationFn: payload => createProduct(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    });

  const useUpdateProduct = () =>
    useMutation<Product, Error, { slug: string; data: Partial<ProductPayload> }>({
      mutationFn: ({ slug, data }) => updateProduct(slug, data),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: ['products'] });
        qc.invalidateQueries({ queryKey: ['product', vars.slug] });
      },
    });

  const useDeleteProduct = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: slug => deleteProduct(slug),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    });

  const useGetProductsByCategory = (slug: string) =>
    useQuery<Product[]>({
      queryKey: ['products', 'category', slug],
      queryFn: () => fetchProductsByCategory(slug),
      enabled: !!slug,
    });

  const useGetProductsByBrand = (slug: string) =>
    useQuery<Product[]>({
      queryKey: ['products', 'brand', slug],
      queryFn: () => fetchProductsByBrand(slug),
      enabled: !!slug,
    });

  const useGetFeatured = () =>
    useQuery<Product[]>({
      queryKey: ['products', 'featured'],
      queryFn: fetchFeaturedProducts,
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
