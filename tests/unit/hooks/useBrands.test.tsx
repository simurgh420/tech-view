// tests/unit/hooks/useBrands.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useBrands } from '@/hooks/useBrands';
import * as queries from '@/services/brands/api/queries';
import * as mutations from '@/services/brands/api/mutations';

vi.mock('@/services/brands/api/queries');
vi.mock('@/services/brands/api/mutations');

// Wrapper با displayName برای رفع خطای ESLint
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper'; // اضافه کردن displayName
  return Wrapper;
};

describe('useBrands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetBrands', () => {
    it('should fetch brands successfully', async () => {
      const mockBrands = [{ id: '1', name: 'Brand A', slug: 'brand-a' }];
      vi.mocked(queries.fetchBrandsApi).mockResolvedValue(mockBrands as any);

      const { result } = renderHook(() => useBrands().useGetBrands(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockBrands);
      expect(queries.fetchBrandsApi).toHaveBeenCalledTimes(1);
    });
  });

  describe('useGetBrand', () => {
    it('should fetch single brand by slug', async () => {
      const mockBrand = { id: '1', name: 'Brand A', slug: 'brand-a' };
      vi.mocked(queries.fetchBrandBySlugApi).mockResolvedValue(mockBrand as any);

      const { result } = renderHook(() => useBrands().useGetBrand('brand-a'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockBrand);
      expect(queries.fetchBrandBySlugApi).toHaveBeenCalledWith('brand-a');
    });

    it('should not fetch if slug is falsy', () => {
      renderHook(() => useBrands().useGetBrand(''), { wrapper: createWrapper() });
      expect(queries.fetchBrandBySlugApi).not.toHaveBeenCalled();
    });
  });

  describe('useCreateBrand', () => {
    it('should create brand and invalidate queries', async () => {
      const newBrand = { name: 'New Brand' };
      const createdBrand = { id: '2', name: 'New Brand', slug: 'new-brand' };
      vi.mocked(mutations.createBrandRequestApi).mockResolvedValue(createdBrand as any);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      Wrapper.displayName = 'TestWrapper';

      const { result } = renderHook(() => useBrands().useCreateBrand(), {
        wrapper: Wrapper,
      });

      result.current.mutate(newBrand as any);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.createBrandRequestApi).toHaveBeenCalledWith(newBrand);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['brands'] });
    });
  });

  describe('useUpdateBrand', () => {
    it('should update brand and invalidate queries', async () => {
      const updatedBrand = { id: '1', name: 'Updated', slug: 'brand-a' };
      vi.mocked(mutations.updateBrandRequestApi).mockResolvedValue(updatedBrand as any);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      Wrapper.displayName = 'TestWrapper';

      const { result } = renderHook(() => useBrands().useUpdateBrand(), {
        wrapper: Wrapper,
      });

      result.current.mutate({ slug: 'brand-a', data: { name: 'Updated' } });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.updateBrandRequestApi).toHaveBeenCalledWith('brand-a', { name: 'Updated' });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['brands'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['brand', 'brand-a'] });
    });
  });

  describe('useDeleteBrand', () => {
    it('should delete brand and invalidate brands query', async () => {
      vi.mocked(mutations.deleteBrandRequestApi).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      Wrapper.displayName = 'TestWrapper';

      const { result } = renderHook(() => useBrands().useDeleteBrand(), {
        wrapper: Wrapper,
      });

      result.current.mutate('brand-to-delete');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.deleteBrandRequestApi).toHaveBeenCalledWith('brand-to-delete');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['brands'] });
    });
  });
});
