// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, ProductPayload } from '@/types/product';

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
  fetchFilteredProductsApi,
} from '@/services/products/api/queries';

export function useProducts() {
  const qc = useQueryClient();

  // ✅ هوک عمومی برای فیلتر و مرتب‌سازی
  const useGetFilteredProducts = (filters: {
    brand?: string;
    category?: string;
    subCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) =>
    useQuery<Product[]>({
      queryKey: ['products', filters],
      queryFn: () => fetchFilteredProductsApi(filters),
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
    useMutation<Product, Error, ProductPayload>({
      mutationFn: payload => createProductَApi(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    });

  // ✅ آپدیت محصول
  const useUpdateProduct = () =>
    useMutation<Product, Error, { slug: string; data: Partial<ProductPayload> }>({
      mutationFn: ({ slug, data }) => updateProductApi(slug, data),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: ['products'] });
        qc.invalidateQueries({ queryKey: ['product', vars.slug] });
      },
    });

  // ✅ حذف محصول
  const useDeleteProduct = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: slug => deleteProductApi(slug),
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

  return {
    useGetFilteredProducts, // فانکشن اصلی برای فیلتر و مرتب‌سازی
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
