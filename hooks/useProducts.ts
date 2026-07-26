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


export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  filtered: (filters: FiltersProduct) => [...productKeys.all, 'filtered', filters] as const,
  detail: (slug: string) => [...productKeys.all, 'detail', slug] as const,
  byCategory: (slug: string) => [...productKeys.all, 'category', slug] as const,
  byBrand: (slug: string) => [...productKeys.all, 'brand', slug] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  filtersOf: (categorySlug: string) => ['product-filters', categorySlug] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** لیست ساده‌ی محصولات */
export function useGetProducts() {
  return useQuery<Product[]>({
    queryKey: productKeys.lists(),
    queryFn: fetchProductsApi,
  });
}

/** فیلتر و مرتب‌سازی محصولات */
export function useGetFilteredProducts(filters: FiltersProduct) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: productKeys.filtered(filters),
    queryFn: () => fetchFilteredProductsApi(filters),
    staleTime: 1000 * 60 * 2,
  });
}

/** گرفتن یک محصول تکی بر اساس اسلاگ */
export function useGetProduct(slug: string) {
  return useQuery<Product>({
    queryKey: productKeys.detail(slug),
    queryFn: () => fetchProductBySlugApi(slug),
    enabled: !!slug,
  });
}

/** محصولات یک دسته‌بندی */
export function useGetProductsByCategory(slug: string) {
  return useQuery<Product[]>({
    queryKey: productKeys.byCategory(slug),
    queryFn: () => fetchProductsByCategoryApi(slug),
    enabled: !!slug,
  });
}

/** محصولات یک برند */
export function useGetProductsByBrand(slug: string) {
  return useQuery<Product[]>({
    queryKey: productKeys.byBrand(slug),
    queryFn: () => fetchProductsByBrandApi(slug),
    enabled: !!slug,
  });
}

/** محصولات ویژه */
export function useGetFeatured() {
  return useQuery<Product[]>({
    queryKey: productKeys.featured(),
    queryFn: fetchFeaturedProductsApi,
  });
}

/** آپشن‌های فیلتر برای یک دسته‌بندی (رنگ، سایز، برند و ...) */
export function useProductFilters(categorySlug: string) {
  return useQuery<Record<string, string[]>>({
    queryKey: productKeys.filtersOf(categorySlug),
    queryFn: () => fetchProductFiltersApi(categorySlug),
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 30,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** ایجاد محصول جدید */
export function useCreateProduct() {
  const qc = useQueryClient();

  return useMutation<Product, Error, CreateProductPayload>({
    mutationFn: createProductApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/** به‌روزرسانی محصول */
export function useUpdateProduct() {
  const qc = useQueryClient();

  return useMutation<Product, Error, { slug: string; data: UpdateProductInput }>({
    mutationFn: ({ slug, data }) => updateProductApi(slug, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      qc.invalidateQueries({ queryKey: productKeys.detail(vars.slug) });
    },
  });
}

/** حذف محصول */
export function useDeleteProduct() {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
