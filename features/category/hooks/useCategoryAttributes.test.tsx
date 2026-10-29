// features/category/hooks/useCategoryAttributes.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  categoryAttributeKeys,
  useGetCategoryAttributes,
  useGetAdminAttributes,
  useAddCategoryAttribute,
  useUpdateCategoryAttribute,
  useDeleteCategoryAttribute,
  useReorderCategoryAttributes,
} from './useCategoryAttributes';

import * as queries from '@/features/category/client/queries';
import * as mutations from '@/features/category/client/mutations';

vi.mock('@/features/category/client/queries', () => ({
  fetchAdminAttributesApi: vi.fn(),
  fetchCategoryAttributesApi: vi.fn(),
}));

vi.mock('@/features/category/client/mutations', () => ({
  addCategoryAttributeApi: vi.fn(),
  updateCategoryAttributeApi: vi.fn(),
  deleteCategoryAttributeApi: vi.fn(),
  reorderCategoryAttributesApi: vi.fn(),
}));

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createWrapper = (queryClient: QueryClient = createTestClient()) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('useCategoryAttributes hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('categoryAttributeKeys', () => {
    it('should build stable query keys', () => {
      expect(categoryAttributeKeys.all).toEqual(['category-attributes']);
      expect(categoryAttributeKeys.available).toEqual(['attributes']);
      expect(categoryAttributeKeys.detail('phones')).toEqual(['category-attributes', 'phones']);
    });

    it('should generate different keys for different slugs', () => {
      expect(categoryAttributeKeys.detail('a')).not.toEqual(categoryAttributeKeys.detail('b'));
    });
  });

  describe('useGetCategoryAttributes', () => {
    it('should fetch attributes of the given category', async () => {
      const mockData = [{ id: '1', name: 'RAM' }];
      vi.mocked(queries.fetchCategoryAttributesApi).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useGetCategoryAttributes('phones'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(queries.fetchCategoryAttributesApi).toHaveBeenCalledWith('phones');
      expect(queries.fetchCategoryAttributesApi).toHaveBeenCalledTimes(1);
    });

    it('should NOT fetch when categorySlug is empty', () => {
      const { result } = renderHook(() => useGetCategoryAttributes(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(queries.fetchCategoryAttributesApi).not.toHaveBeenCalled();
    });

    it('should refetch when slug changes', async () => {
      vi.mocked(queries.fetchCategoryAttributesApi).mockResolvedValue([] as any);

      const { result, rerender } = renderHook(({ slug }) => useGetCategoryAttributes(slug), {
        wrapper: createWrapper(),
        initialProps: { slug: 'phones' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      rerender({ slug: 'laptops' });

      await waitFor(() =>
        expect(queries.fetchCategoryAttributesApi).toHaveBeenCalledWith('laptops')
      );
      expect(queries.fetchCategoryAttributesApi).toHaveBeenCalledTimes(2);
    });

    it('should use cache (staleTime) and not refetch on second mount', async () => {
      vi.mocked(queries.fetchCategoryAttributesApi).mockResolvedValue([] as any);
      const queryClient = createTestClient();

      const first = renderHook(() => useGetCategoryAttributes('phones'), {
        wrapper: createWrapper(queryClient),
      });
      await waitFor(() => expect(first.result.current.isSuccess).toBe(true));

      const second = renderHook(() => useGetCategoryAttributes('phones'), {
        wrapper: createWrapper(queryClient),
      });
      await waitFor(() => expect(second.result.current.isSuccess).toBe(true));

      expect(queries.fetchCategoryAttributesApi).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Network error');
      vi.mocked(queries.fetchCategoryAttributesApi).mockRejectedValue(error);

      const { result } = renderHook(() => useGetCategoryAttributes('phones'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useGetAdminAttributes', () => {
    it('should fetch available attributes', async () => {
      const mockData = [{ id: 'a1', name: 'Color' }];
      vi.mocked(queries.fetchAdminAttributesApi).mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useGetAdminAttributes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(queries.fetchAdminAttributesApi).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Forbidden');
      vi.mocked(queries.fetchAdminAttributesApi).mockRejectedValue(error);

      const { result } = renderHook(() => useGetAdminAttributes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  // چهار mutation یک الگوی یکسان دارند، پس با it.each تست می‌شوند
  describe.each([
    ['useAddCategoryAttribute', useAddCategoryAttribute, 'addCategoryAttributeApi'],
    ['useUpdateCategoryAttribute', useUpdateCategoryAttribute, 'updateCategoryAttributeApi'],
    ['useDeleteCategoryAttribute', useDeleteCategoryAttribute, 'deleteCategoryAttributeApi'],
    ['useReorderCategoryAttributes', useReorderCategoryAttributes, 'reorderCategoryAttributesApi'],
  ] as const)('%s', (_name, useHook, apiName) => {
    const variables = { categorySlug: 'phones', attributeId: 'a1' } as any;

    it('should call the API with variables and invalidate the category detail query', async () => {
      const apiMock = vi.mocked(mutations[apiName] as any);
      apiMock.mockResolvedValue({ success: true });

      const queryClient = createTestClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useHook(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(variables);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // React Query ممکن است آرگومان دوم (context) هم پاس بدهد، پس فقط اولی را چک می‌کنیم
      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock.mock.calls[0][0]).toEqual(variables);

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: categoryAttributeKeys.detail('phones'),
      });
    });

    it('should NOT invalidate other categories', async () => {
      vi.mocked(mutations[apiName] as any).mockResolvedValue({ success: true });

      const queryClient = createTestClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useHook(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(variables);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: categoryAttributeKeys.detail('laptops'),
      });
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle error and not invalidate', async () => {
      const error = new Error('Mutation failed');
      vi.mocked(mutations[apiName] as any).mockRejectedValue(error);

      const queryClient = createTestClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useHook(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(variables);
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });
});
