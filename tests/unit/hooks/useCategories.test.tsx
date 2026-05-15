// tests/unit/hooks/useCategories.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCategories } from '@/hooks/useCategories';
import * as queries from '@/services/categories/api/queries';
import * as mutations from '@/services/categories/api/mutations';

vi.mock('@/services/categories/api/queries', () => ({
  fetchCategoriesApi: vi.fn(),
  fetchCategoryBySlugApi: vi.fn(),
}));

vi.mock('@/services/categories/api/mutations', () => ({
  createCategoryRequestApi: vi.fn(),
  updateCategoryRequestApi: vi.fn(),
  deleteCategoryRequestApi: vi.fn(),
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

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = [
        { id: '1', title: 'Electronics', slug: 'electronics' },
        { id: '2', title: 'Clothing', slug: 'clothing' },
      ];
      (queries.fetchCategoriesApi as any).mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useCategories().useGetCategories(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockCategories);
      expect(queries.fetchCategoriesApi).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetch fails', async () => {
      const error = new Error('Network error');
      (queries.fetchCategoriesApi as any).mockRejectedValue(error);

      const { result } = renderHook(() => useCategories().useGetCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useGetCategory', () => {
    const slug = 'electronics';
    const mockCategory = { id: '1', title: 'Electronics', slug };

    it('should fetch category by slug when slug is provided', async () => {
      (queries.fetchCategoryBySlugApi as any).mockResolvedValue(mockCategory);
      const { result } = renderHook(() => useCategories().useGetCategory(slug), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockCategory);
      expect(queries.fetchCategoryBySlugApi).toHaveBeenCalledWith(slug);
    });

    it('should not fetch when slug is falsy', () => {
      renderHook(() => useCategories().useGetCategory(''), { wrapper: createWrapper() });
      expect(queries.fetchCategoryBySlugApi).not.toHaveBeenCalled();
    });

    it('should handle error', async () => {
      const error = new Error('Not found');
      (queries.fetchCategoryBySlugApi as any).mockRejectedValue(error);
      const { result } = renderHook(() => useCategories().useGetCategory(slug), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useCreateCategory', () => {
    const input = { title: 'New Category' };
    const createdCategory = { id: '3', title: 'New Category', slug: 'new-category' };

    it('should create category and invalidate categories query', async () => {
      (mutations.createCategoryRequestApi as any).mockResolvedValue(createdCategory);
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCategories().useCreateCategory(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.createCategoryRequestApi).toHaveBeenCalledWith(input, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
    });
  });

  describe('useUpdateCategory', () => {
    const slug = 'electronics';
    const data = { title: 'Updated Electronics' };
    const updatedCategory = { id: '1', title: 'Updated Electronics', slug: 'updated-electronics' };

    it('should update category and invalidate categories and single category queries', async () => {
      (mutations.updateCategoryRequestApi as any).mockResolvedValue(updatedCategory);
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCategories().useUpdateCategory(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate({ slug, data });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.updateCategoryRequestApi).toHaveBeenCalledWith(slug, data);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['category', slug] });
    });
  });

  describe('useDeleteCategory', () => {
    const slug = 'electronics';

    it('should delete category and invalidate categories query', async () => {
      (mutations.deleteCategoryRequestApi as any).mockResolvedValue({ success: true });
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCategories().useDeleteCategory(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(slug);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.deleteCategoryRequestApi).toHaveBeenCalledWith(slug, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
    });
  });
});
