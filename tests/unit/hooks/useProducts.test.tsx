// __tests__/hooks/useProducts.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import * as queries from '@/services/products/api/queries';
import * as mutations from '@/services/products/api/mutations';

import {
  useGetProducts,
  useGetFilteredProducts,
  useGetProduct,
  useGetProductsByCategory,
  useGetProductsByBrand,
  useGetFeatured,
  useProductFilters,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  productKeys,
} from '@/hooks/useProducts';

import { CreateProductPayload } from '@/lib/validation/product';

// ─── Mocks ───────────────────────────────────────────────
vi.mock('@/services/products/api/queries', () => ({
  fetchProductsApi: vi.fn(),
  fetchProductBySlugApi: vi.fn(),
  fetchFilteredProductsApi: vi.fn(),
  fetchProductsByCategoryApi: vi.fn(),
  fetchProductsByBrandApi: vi.fn(),
  fetchFeaturedProductsApi: vi.fn(),
  fetchProductFiltersApi: vi.fn(),
}));

vi.mock('@/services/products/api/mutations', () => ({
  createProductApi: vi.fn(),
  updateProductApi: vi.fn(),
  deleteProductApi: vi.fn(),
}));

// ─── Test wrapper ────────────────────────────────────────
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

// ─── Tests ───────────────────────────────────────────────
describe('useProducts hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetProducts', () => {
    it('should fetch all products', async () => {
      const mockProducts = [{ id: 'p1', title: 'Product 1' }];
      (queries.fetchProductsApi as any).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useGetProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockProducts);
      expect(queries.fetchProductsApi).toHaveBeenCalledTimes(1);
    });
  });

  describe('useGetProduct', () => {
    const slug = 'test-product';
    const mockProduct = { id: 'p1', slug, title: 'Test' };

    it('should fetch product by slug', async () => {
      (queries.fetchProductBySlugApi as any).mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useGetProduct(slug), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockProduct);
      expect(queries.fetchProductBySlugApi).toHaveBeenCalledWith(slug);
    });

    it('should not fetch if slug is falsy', () => {
      renderHook(() => useGetProduct(''), { wrapper: createWrapper() });
      expect(queries.fetchProductBySlugApi).not.toHaveBeenCalled();
    });
  });

  describe('useGetFilteredProducts', () => {
    it('should fetch filtered products with given filters', async () => {
      const filters = { brandSlug: 'nike', minPrice: 100 };
      const mockResponse = { data: [{ id: 'p1' }], total: 1, page: 1, limit: 10 };
      (queries.fetchFilteredProductsApi as any).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGetFilteredProducts(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queries.fetchFilteredProductsApi).toHaveBeenCalledWith(filters);
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useGetProductsByCategory', () => {
    const slug = 'shoes';
    const mockProducts = [{ id: 'p1' }];

    it('should fetch products by category', async () => {
      (queries.fetchProductsByCategoryApi as any).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useGetProductsByCategory(slug), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queries.fetchProductsByCategoryApi).toHaveBeenCalledWith(slug);
      expect(result.current.data).toEqual(mockProducts);
    });

    it('should not fetch if slug is falsy', () => {
      renderHook(() => useGetProductsByCategory(''), { wrapper: createWrapper() });
      expect(queries.fetchProductsByCategoryApi).not.toHaveBeenCalled();
    });
  });

  describe('useGetProductsByBrand', () => {
    const slug = 'nike';
    const mockProducts = [{ id: 'p1' }];

    it('should fetch products by brand', async () => {
      (queries.fetchProductsByBrandApi as any).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useGetProductsByBrand(slug), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queries.fetchProductsByBrandApi).toHaveBeenCalledWith(slug);
      expect(result.current.data).toEqual(mockProducts);
    });

    it('should not fetch if slug is falsy', () => {
      renderHook(() => useGetProductsByBrand(''), { wrapper: createWrapper() });
      expect(queries.fetchProductsByBrandApi).not.toHaveBeenCalled();
    });
  });

  describe('useGetFeatured', () => {
    const mockProducts = [{ id: 'p1', isFeatured: true }];

    it('should fetch featured products', async () => {
      (queries.fetchFeaturedProductsApi as any).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useGetFeatured(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queries.fetchFeaturedProductsApi).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockProducts);
    });
  });

  describe('useProductFilters', () => {
    const categorySlug = 'shoes';
    const mockFilters = { color: ['red', 'blue'], size: ['S', 'M'] };

    it('should fetch filters for category', async () => {
      (queries.fetchProductFiltersApi as any).mockResolvedValue(mockFilters);

      const { result } = renderHook(() => useProductFilters(categorySlug), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queries.fetchProductFiltersApi).toHaveBeenCalledWith(categorySlug);
      expect(result.current.data).toEqual(mockFilters);
    });

    it('should not fetch if categorySlug is falsy', () => {
      renderHook(() => useProductFilters(''), { wrapper: createWrapper() });
      expect(queries.fetchProductFiltersApi).not.toHaveBeenCalled();
    });
  });

  // ─── Mutations ──────────────────────────────────────────

  describe('useCreateProduct', () => {
    const input: CreateProductPayload = {
      title: 'New',
      description: 'This is a very long description that exceeds twenty characters easily.',
      price: 100,
      brandSlug: 'nike',
      categorySlug: 'shoes',
      stockQuantity: 10,
      images: [],
      keyFeatures: [],
      colors: [],
      variants: [],
      specifications: [],
      isFeatured: false,
      isNew: true,
      status: 'DRAFT',
      thumbnail: null,
      discountPrice: null,
      subCategorySlug: null,
    };
    const createdProduct = { id: 'p1', ...input };

    it('should create product and invalidate products query', async () => {
      (mutations.createProductApi as any).mockResolvedValue(createdProduct);

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateProduct(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(input);

      // Wait for mutation to succeed
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Ensure invalidation was called
      await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());

      expect(mutations.createProductApi).toHaveBeenCalledWith(input, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: productKeys.all });
    });
  });

  describe('useUpdateProduct', () => {
    const slug = 'test';
    const data = { title: 'Updated' };
    const updatedProduct = { id: 'p1', slug, title: 'Updated' };

    it('should update product and invalidate products and single product queries', async () => {
      (mutations.updateProductApi as any).mockResolvedValue(updatedProduct);

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateProduct(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate({ slug, data });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mutations.updateProductApi).toHaveBeenCalledWith(slug, data);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: productKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: productKeys.detail(slug),
      });
    });
  });

  describe('useDeleteProduct', () => {
    const slug = 'test';

    it('should delete product and invalidate products query', async () => {
      (mutations.deleteProductApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteProduct(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(slug);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Ensure invalidation was called
      await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());

      expect(mutations.deleteProductApi).toHaveBeenCalledWith(slug, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: productKeys.all });
    });
  });
});
