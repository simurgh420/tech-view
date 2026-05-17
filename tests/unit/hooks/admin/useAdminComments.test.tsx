// tests/unit/hooks/useAdminComments.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import * as queries from '@/services/comments/api/queries';
import * as mutations from '@/services/comments/api/mutations';
import { useAdminComments } from '@/hooks/useAdmin/useAdminComments';

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

describe('useAdminComments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch comments and return data', async () => {
    const mockComments = [{ id: '1', content: 'Test comment' }];
    (queries.fetchAllCommentsAdminApi as any).mockResolvedValue(mockComments);
    const { result } = renderHook(() => useAdminComments(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.comments).toEqual(mockComments);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should return empty array if no comments', async () => {
    (queries.fetchAllCommentsAdminApi as any).mockResolvedValue([]);
    const { result } = renderHook(() => useAdminComments(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.comments).toEqual([]);
  });

  it('should handle fetch error', async () => {
    const error = new Error('Network error');
    (queries.fetchAllCommentsAdminApi as any).mockRejectedValue(error);
    const { result } = renderHook(() => useAdminComments(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.comments).toEqual([]);
    expect(result.current.error).toEqual(error);
  });

  it('should delete comment and invalidate queries', async () => {
    const mockComments = [{ id: '1', content: 'Test' }];
    (queries.fetchAllCommentsAdminApi as any).mockResolvedValue(mockComments);
    (mutations.deleteCommentApi as any).mockResolvedValue({ success: true });

    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAdminComments(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.deleteComment.mutate('1');
    await waitFor(() => expect(result.current.deleteComment.isSuccess).toBe(true));
    expect(mutations.deleteCommentApi).toHaveBeenCalledWith('1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-comments'] });
  });

  it('should handle error in delete mutation', async () => {
    const mockComments = [{ id: '1', content: 'Test' }];
    (queries.fetchAllCommentsAdminApi as any).mockResolvedValue(mockComments);
    const error = new Error('Delete failed');
    (mutations.deleteCommentApi as any).mockRejectedValue(error);

    const { result } = renderHook(() => useAdminComments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.deleteComment.mutate('1');
    await waitFor(() => expect(result.current.deleteComment.isError).toBe(true));
    expect(result.current.deleteComment.error).toEqual(error);
  });
});
