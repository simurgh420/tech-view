// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiltersProduct, PaginatedResponse, Product } from '@/types/product';

import {
  createProductApi,
  deleteProductApi,
  updateProductApi,
} from '@/services/products/api/mutations';

import {
  fetchFeaturedProductsApi,
  fetchProductBySlugApi,
  fetchProductsApi,
  fetchProductsByBrandApi,
  fetchProductsByCategoryApi,
  fetchFilteredProductsApi,
  fetchProductFiltersApi,
} from '@/services/products/api/queries';
import { CreateProductPayload, UpdateProductInput } from '@/lib/validation/product';

export function useProducts() {
  const qc = useQueryClient();

  // ✅ هوک عمومی برای فیلتر و مرتب‌سازی
  const useGetFilteredProducts = (filters: FiltersProduct) =>
    useQuery<PaginatedResponse<Product>>({
      queryKey: ['products', filters],
      queryFn: () => fetchFilteredProductsApi(filters),
      staleTime: 1000 * 60 * 2,
    });

  // ✅ لیست ساده محصولات
  const useGetProducts = () =>
    useQuery<Product[]>({
      queryKey: ['products'],
      queryFn: fetchProductsApi,
    });
  // ✅ گرفتن محصول تکی
  const useGetProduct = (slug: string) =>
    useQuery<Product>({
      queryKey: ['product', slug],
      queryFn: () => fetchProductBySlugApi(slug),
      enabled: !!slug,
    });

  // ✅ ایجاد محصول
  const useCreateProduct = () =>
    useMutation<Product, Error, CreateProductPayload>({
      mutationFn: createProductApi,

      onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    });

  // ✅ آپدیت محصول
  const useUpdateProduct = () =>
    useMutation<Product, Error, { slug: string; data: UpdateProductInput }>({
      mutationFn: ({ slug, data }) => updateProductApi(slug, data),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: ['products'] });
        qc.invalidateQueries({ queryKey: ['product', vars.slug] });
      },
    });
  // ✅ حذف محصول
  const useDeleteProduct = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: deleteProductApi,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    });

  // ✅ محصولات بر اساس دسته‌بندی
  const useGetProductsByCategory = (slug: string) =>
    useQuery<Product[]>({
      queryKey: ['products', 'category', slug],
      queryFn: () => fetchProductsByCategoryApi(slug),
      enabled: !!slug,
    });
  // ✅ محصولات بر اساس برند
  const useGetProductsByBrand = (slug: string) =>
    useQuery<Product[]>({
      queryKey: ['products', 'brand', slug],
      queryFn: () => fetchProductsByBrandApi(slug),
      enabled: !!slug,
    });
  // ✅ محصولات ویژه
  const useGetFeatured = () =>
    useQuery<Product[]>({
      queryKey: ['products', 'featured'],
      queryFn: fetchFeaturedProductsApi,
    });
  const useProductFilters = (categorySlug: string) =>
    useQuery<Record<string, string[]>>({
      queryKey: ['product-filters', categorySlug],
      queryFn: () => fetchProductFiltersApi(categorySlug),
      enabled: !!categorySlug,
      staleTime: 1000 * 60 * 30,
    });
  return {
    useGetFilteredProducts,
    useGetProducts,
    useGetProduct,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    useGetProductsByCategory,
    useGetProductsByBrand,
    useGetFeatured,
    useProductFilters,
  };
}
