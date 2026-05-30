import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import * as queries from '@/services/products/api/queries';
import * as mutations from '@/services/products/api/mutations';
import { CreateProductPayload } from '@/lib/validation/product';

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

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetProducts', () => {
    it('should fetch all products', async () => {
      const mockProducts = [{ id: 'p1', title: 'Product 1' }];
      (queries.fetchProductsApi as any).mockResolvedValue(mockProducts);
      const { result } = renderHook(() => useProducts().useGetProducts(), {
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
      const { result } = renderHook(() => useProducts().useGetProduct(slug), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockProduct);
      expect(queries.fetchProductBySlugApi).toHaveBeenCalledWith(slug);
    });

    it('should not fetch if slug is falsy', () => {
      renderHook(() => useProducts().useGetProduct(''), { wrapper: createWrapper() });
      expect(queries.fetchProductBySlugApi).not.toHaveBeenCalled();
    });
  });

  describe('useGetFilteredProducts', () => {
    it('should fetch filtered products with given filters', async () => {
      const filters = { brandSlug: 'nike', minPrice: 100 };
      const mockProducts = [{ id: 'p1' }];
      (queries.fetchFilteredProductsApi as any).mockResolvedValue(mockProducts);
      const { result } = renderHook(() => useProducts().useGetFilteredProducts(filters), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queries.fetchFilteredProductsApi).toHaveBeenCalledWith(filters);
      expect(result.current.data).toEqual(mockProducts);
    });
  });

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
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useProducts().useCreateProduct(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.createProductApi).toHaveBeenCalledWith(input, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
    });
  });

  describe('useUpdateProduct', () => {
    const slug = 'test';
    const data = { title: 'Updated' };
    const updatedProduct = { id: 'p1', slug, title: 'Updated' };

    it('should update product and invalidate products and single product queries', async () => {
      (mutations.updateProductApi as any).mockResolvedValue(updatedProduct);
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useProducts().useUpdateProduct(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate({ slug, data });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.updateProductApi).toHaveBeenCalledWith(slug, data);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['product', slug] });
    });
  });

  describe('useDeleteProduct', () => {
    const slug = 'test';

    it('should delete product and invalidate products query', async () => {
      (mutations.deleteProductApi as any).mockResolvedValue({ success: true });
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useProducts().useDeleteProduct(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate(slug);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.deleteProductApi).toHaveBeenCalledWith(slug, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
    });
  });

  describe('useGetProductsByCategory', () => {
    const slug = 'shoes';
    const mockProducts = [{ id: 'p1' }];

    it('should fetch products by category', async () => {
      (queries.fetchProductsByCategoryApi as any).mockResolvedValue(mockProducts);
      const { result } = renderHook(() => useProducts().useGetProductsByCategory(slug), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queries.fetchProductsByCategoryApi).toHaveBeenCalledWith(slug);
      expect(result.current.data).toEqual(mockProducts);
    });
  });

  describe('useGetProductsByBrand', () => {
    const slug = 'nike';
    const mockProducts = [{ id: 'p1' }];

    it('should fetch products by brand', async () => {
      (queries.fetchProductsByBrandApi as any).mockResolvedValue(mockProducts);
      const { result } = renderHook(() => useProducts().useGetProductsByBrand(slug), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queries.fetchProductsByBrandApi).toHaveBeenCalledWith(slug);
      expect(result.current.data).toEqual(mockProducts);
    });
  });

  describe('useGetFeatured', () => {
    const mockProducts = [{ id: 'p1', isFeatured: true }];

    it('should fetch featured products', async () => {
      (queries.fetchFeaturedProductsApi as any).mockResolvedValue(mockProducts);
      const { result } = renderHook(() => useProducts().useGetFeatured(), {
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
      const { result } = renderHook(() => useProducts().useProductFilters(categorySlug), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queries.fetchProductFiltersApi).toHaveBeenCalledWith(categorySlug);
      expect(result.current.data).toEqual(mockFilters);
    });

    it('should not fetch if categorySlug is falsy', () => {
      renderHook(() => useProducts().useProductFilters(''), { wrapper: createWrapper() });
      expect(queries.fetchProductFiltersApi).not.toHaveBeenCalled();
    });
  });
});
