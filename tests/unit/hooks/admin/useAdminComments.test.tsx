// tests/unit/hooks/useAdminComments.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  useGetAdminComments,
  useDeleteAdminComment,
  adminCommentKeys,
} from '@/hooks/useAdmin/useAdminComments';

import * as queries from '@/services/comments/api/queries';
import * as mutations from '@/services/comments/api/mutations';

vi.mock('@/services/comments/api/queries', () => ({
  fetchAllCommentsAdminApi: vi.fn(),
}));

vi.mock('@/services/comments/api/mutations', () => ({
  deleteCommentApi: vi.fn(),
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

describe('useAdminComments hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetAdminComments', () => {
    it('should fetch comments and return data', async () => {
      const mockComments = [{ id: '1', content: 'Test comment' }];
      (queries.fetchAllCommentsAdminApi as any).mockResolvedValue(mockComments);

      const { result } = renderHook(() => useGetAdminComments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockComments);
      expect(queries.fetchAllCommentsAdminApi).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Network error');
      (queries.fetchAllCommentsAdminApi as any).mockRejectedValue(error);

      const { result } = renderHook(() => useGetAdminComments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useDeleteAdminComment', () => {
    it('should delete comment and invalidate admin-comments query', async () => {
      (mutations.deleteCommentApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteAdminComment(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate('1');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mutations.deleteCommentApi).toHaveBeenCalledWith('1');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: adminCommentKeys.all });
    });

    it('should handle error in delete mutation', async () => {
      const error = new Error('Delete failed');
      (mutations.deleteCommentApi as any).mockRejectedValue(error);

      const queryClient = new QueryClient();
      const { result } = renderHook(() => useDeleteAdminComment(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate('1');
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });
});
