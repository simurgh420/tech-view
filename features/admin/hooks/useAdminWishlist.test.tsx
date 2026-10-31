// tests/unit/hooks/useAdminWishlist.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import * as adminClient from '@/features/wishlist/client/admin';
import * as mutations from '@/features/wishlist/client/mutations';
import {
  adminWishlistKeys,
  useAdminWishlist,
  useDeleteAdminWishlistItem,
} from './useAdminWishlist';

vi.mock('@/features/wishlist/client/admin', () => ({
  fetchAdminWishlistApi: vi.fn(),
}));

vi.mock('@/features/wishlist/client/mutations', () => ({
  deleteWishlistItemApi: vi.fn(),
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

describe('useAdminWishlist hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('adminWishlistKeys', () => {
    it('should expose a stable query key', () => {
      expect(adminWishlistKeys.all).toEqual(['admin-wishlist']);
    });
  });

  describe('useAdminWishlist', () => {
    it('should fetch wishlist items and return data', async () => {
      const mockItems = [{ id: '1' }, { id: '2' }];
      vi.mocked(adminClient.fetchAdminWishlistApi).mockResolvedValue(mockItems as any);

      const { result } = renderHook(() => useAdminWishlist(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockItems);
      expect(adminClient.fetchAdminWishlistApi).toHaveBeenCalledTimes(1);
    });

    it('should handle empty wishlist', async () => {
      vi.mocked(adminClient.fetchAdminWishlistApi).mockResolvedValue([]);

      const { result } = renderHook(() => useAdminWishlist(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Network error');
      vi.mocked(adminClient.fetchAdminWishlistApi).mockRejectedValue(error);

      const { result } = renderHook(() => useAdminWishlist(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useDeleteAdminWishlistItem', () => {
    it('should delete item and invalidate admin-wishlist query', async () => {
      vi.mocked(mutations.deleteWishlistItemApi).mockResolvedValue({ success: true });

      const queryClient = createTestClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteAdminWishlistItem(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate('1');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mutations.deleteWishlistItemApi).toHaveBeenCalledWith('1');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminWishlistKeys.all });
    });

    it('should handle error in delete mutation and not invalidate', async () => {
      const error = new Error('Delete failed');
      vi.mocked(mutations.deleteWishlistItemApi).mockRejectedValue(error);

      const queryClient = createTestClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteAdminWishlistItem(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate('1');
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });
});
