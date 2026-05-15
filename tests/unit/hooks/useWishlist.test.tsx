// tests/unit/hooks/useWishlist.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import * as queries from '@/services/wishlist/api/queries';
import * as mutations from '@/services/wishlist/api/mutations';

vi.mock('@/services/wishlist/api/queries', () => ({
  fetchWishlistApi: vi.fn(),
  fetchWishlistCheckApi: vi.fn(),
}));

vi.mock('@/services/wishlist/api/mutations', () => ({
  addWishlistItemApi: vi.fn(),
  deleteWishlistItemApi: vi.fn(),
  deleteWishlistItemByUserAndProductApi: vi.fn(),
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

describe('useWishlist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetWishlist', () => {
    it('should fetch wishlist items successfully', async () => {
      const mockItems = [{ id: 'w1', productId: 'p1', product: { title: 'Product 1' } }];
      (queries.fetchWishlistApi as any).mockResolvedValue(mockItems);
      const { result } = renderHook(() => useWishlist().useGetWishlist(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockItems);
      expect(queries.fetchWishlistApi).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetch fails', async () => {
      const error = new Error('Network error');
      (queries.fetchWishlistApi as any).mockRejectedValue(error);
      const { result } = renderHook(() => useWishlist().useGetWishlist(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useAddToWishlist', () => {
    const input = { productId: 'p1' };
    const createdItem = { id: 'w1', productId: 'p1' };

    it('should add item and invalidate wishlist query', async () => {
      (mutations.addWishlistItemApi as any).mockResolvedValue(createdItem);
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useWishlist().useAddToWishlist(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // ✅ استفاده از expect.anything() برای نادیده گرفتن آرگومان context
      expect(mutations.addWishlistItemApi).toHaveBeenCalledWith(input, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['wishlist'] });
    });
  });

  describe('useRemoveFromWishlist', () => {
    const id = 'w1';

    it('should remove item by id and invalidate wishlist query', async () => {
      (mutations.deleteWishlistItemApi as any).mockResolvedValue({ success: true });
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useWishlist().useRemoveFromWishlist(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate(id);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // ✅ استفاده از expect.anything() برای نادیده گرفتن آرگومان context
      expect(mutations.deleteWishlistItemApi).toHaveBeenCalledWith(id, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['wishlist'] });
    });
  });

  describe('useCheckWishlist', () => {
    const productId = 'p1';

    it('should fetch check status when productId is provided', async () => {
      (queries.fetchWishlistCheckApi as any).mockResolvedValue({ inWishlist: true });
      const { result } = renderHook(() => useWishlist().useCheckWishlist(productId), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({ inWishlist: true });
      expect(queries.fetchWishlistCheckApi).toHaveBeenCalledWith(productId);
    });

    it('should not fetch when productId is falsy', () => {
      renderHook(() => useWishlist().useCheckWishlist(''), { wrapper: createWrapper() });
      expect(queries.fetchWishlistCheckApi).not.toHaveBeenCalled();
    });
  });

  describe('useToggleWishlistByProduct', () => {
    const productId = 'p1';

    it('should delete when exists is true and invalidate both wishlist and check queries', async () => {
      const mockDeleteResponse = { success: true };
      (mutations.deleteWishlistItemByUserAndProductApi as any).mockResolvedValue(
        mockDeleteResponse
      );
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useWishlist().useToggleWishlistByProduct(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate({ productId, exists: true });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // ✅ فقط یک آرگومان (productId)
      expect(mutations.deleteWishlistItemByUserAndProductApi).toHaveBeenCalledWith(productId);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['wishlist'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['wishlist', 'check', productId] });
    });

    it('should add when exists is false and invalidate both wishlist and check queries', async () => {
      (mutations.addWishlistItemApi as any).mockResolvedValue({});
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useWishlist().useToggleWishlistByProduct(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate({ productId, exists: false });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // ✅ فقط یک آرگومان (آبجکت productId)
      expect(mutations.addWishlistItemApi).toHaveBeenCalledWith({ productId });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['wishlist'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['wishlist', 'check', productId] });
    });

    it('should propagate error when delete fails', async () => {
      const error = new Error('Delete failed');
      (mutations.deleteWishlistItemByUserAndProductApi as any).mockRejectedValue(error);
      const queryClient = new QueryClient();
      const { result } = renderHook(() => useWishlist().useToggleWishlistByProduct(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate({ productId, exists: true });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });

    it('should propagate error when add fails', async () => {
      const error = new Error('Add failed');
      (mutations.addWishlistItemApi as any).mockRejectedValue(error);
      const queryClient = new QueryClient();
      const { result } = renderHook(() => useWishlist().useToggleWishlistByProduct(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate({ productId, exists: false });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });
});
