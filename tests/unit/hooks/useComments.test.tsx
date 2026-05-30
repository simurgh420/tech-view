// tests/unit/hooks/useComments.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useComments } from '@/hooks/useComments';
import * as queries from '@/services/comments/api/queries';
import * as mutations from '@/services/comments/api/mutations';

vi.mock('@/services/comments/api/queries', () => ({
  fetchCommentsApi: vi.fn(),
}));

vi.mock('@/services/comments/api/mutations', () => ({
  addCommentApi: vi.fn(),
  updateCommentApi: vi.fn(),
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

describe('useComments', () => {
  const postId = 'post-123';
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetComments', () => {
    it('should fetch comments successfully', async () => {
      const mockComments = [{ id: 'c1', content: 'Great!', authorName: 'John' }];
      (queries.fetchCommentsApi as any).mockResolvedValue(mockComments);
      const { result } = renderHook(() => useComments(postId).useGetComments(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockComments);
      expect(queries.fetchCommentsApi).toHaveBeenCalledWith(postId);
    });

    it('should handle error when fetch fails', async () => {
      const error = new Error('Network error');
      (queries.fetchCommentsApi as any).mockRejectedValue(error);
      const { result } = renderHook(() => useComments(postId).useGetComments(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useAddComment', () => {
    const input = { content: 'New comment', rating: 5 };
    const mockComment = { id: 'c2', ...input, authorName: 'Me' };

    it('should add comment and invalidate comments query', async () => {
      (mutations.addCommentApi as any).mockResolvedValue(mockComment);
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useComments(postId).useAddComment(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.addCommentApi).toHaveBeenCalledWith(postId, input);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', postId] });
    });
  });

  describe('useUpdateComment', () => {
    const params = { commentId: 'c1', data: { content: 'Updated' } };
    const mockUpdated = { id: 'c1', content: 'Updated', rating: 5 };

    it('should update comment and invalidate comments query', async () => {
      (mutations.updateCommentApi as any).mockResolvedValue(mockUpdated);
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useComments(postId).useUpdateComment(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate(params);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.updateCommentApi).toHaveBeenCalledWith(params.commentId, params.data);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', postId] });
    });
  });

  describe('useDeleteComment', () => {
    const commentId = 'c1';

    it('should delete comment and invalidate comments query', async () => {
      (mutations.deleteCommentApi as any).mockResolvedValue({ success: true });
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useComments(postId).useDeleteComment(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate(commentId);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.deleteCommentApi).toHaveBeenCalledWith(commentId);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', postId] });
    });
  });
});
