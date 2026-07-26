// tests/unit/hooks/useBrands.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  useGetBrands,
  useGetBrand,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
  brandKeys,
} from '@/hooks/useBrands';

import * as queries from '@/services/brands/api/queries';
import * as mutations from '@/services/brands/api/mutations';

// ─── Mock API ها ──────────────────────────────────────────
vi.mock('@/services/brands/api/queries', () => ({
  fetchBrandsApi: vi.fn(),
  fetchBrandBySlugApi: vi.fn(),
}));

vi.mock('@/services/brands/api/mutations', () => ({
  createBrandRequestApi: vi.fn(),
  updateBrandRequestApi: vi.fn(),
  deleteBrandRequestApi: vi.fn(),
}));

// ─── Wrapper تست ──────────────────────────────────────────
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

// ─── تست‌ها ──────────────────────────────────────────────
describe('useBrands hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetBrands', () => {
    it('should fetch brands successfully', async () => {
      const mockBrands = [{ id: '1', name: 'Brand A', slug: 'brand-a' }];
      (queries.fetchBrandsApi as any).mockResolvedValue(mockBrands);

      const { result } = renderHook(() => useGetBrands(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockBrands);
      expect(queries.fetchBrandsApi).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetch fails', async () => {
      const error = new Error('Network error');
      (queries.fetchBrandsApi as any).mockRejectedValue(error);

      const { result } = renderHook(() => useGetBrands(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useGetBrand', () => {
    const slug = 'brand-a';
    const mockBrand = { id: '1', name: 'Brand A', slug };

    it('should fetch single brand by slug when provided', async () => {
      (queries.fetchBrandBySlugApi as any).mockResolvedValue(mockBrand);

      const { result } = renderHook(() => useGetBrand(slug), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockBrand);
      expect(queries.fetchBrandBySlugApi).toHaveBeenCalledWith(slug);
    });

    it('should not fetch if slug is falsy', () => {
      renderHook(() => useGetBrand(''), { wrapper: createWrapper() });
      expect(queries.fetchBrandBySlugApi).not.toHaveBeenCalled();
    });

    it('should handle error', async () => {
      const error = new Error('Not found');
      (queries.fetchBrandBySlugApi as any).mockRejectedValue(error);

      const { result } = renderHook(() => useGetBrand(slug), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useCreateBrand', () => {
    // اصلاح: اضافه کردن isActive که در تایپ الزامی است
    const input = { name: 'New Brand', isActive: true };
    const createdBrand = { id: '2', name: 'New Brand', slug: 'new-brand', isActive: true };

    it('should create brand and invalidate brands query', async () => {
      (mutations.createBrandRequestApi as any).mockResolvedValue(createdBrand);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateBrand(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mutations.createBrandRequestApi).toHaveBeenCalledWith(input);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: brandKeys.all });
    });
  });

  describe('useUpdateBrand', () => {
    const slug = 'brand-a';
    // اصلاح: داده‌های به‌روزرسانی شامل isActive (اختیاری است ولی برای سازگاری اضافه می‌کنیم)
    const data = { name: 'Updated Brand', isActive: false };
    const updatedBrand = { id: '1', name: 'Updated Brand', slug: 'updated-brand', isActive: false };

    it('should update brand and invalidate brands and single brand queries', async () => {
      (mutations.updateBrandRequestApi as any).mockResolvedValue(updatedBrand);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateBrand(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate({ slug, data });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mutations.updateBrandRequestApi).toHaveBeenCalledWith(slug, data);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: brandKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: brandKeys.detail(slug) });
    });
  });

  describe('useDeleteBrand', () => {
    const slug = 'brand-to-delete';

    it('should delete brand and invalidate brands query', async () => {
      (mutations.deleteBrandRequestApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteBrand(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(slug);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mutations.deleteBrandRequestApi).toHaveBeenCalledWith(slug);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: brandKeys.all });
    });
  });
});
