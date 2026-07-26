// tests/unit/hooks/useProductComments.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  useGetComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  productCommentKeys,
} from '@/hooks/useProductComments';

import * as queries from '@/services/productComments/api/queries';
import * as mutations from '@/services/productComments/api/mutations';

vi.mock('@/services/productComments/api/queries', () => ({
  fetchCommentsByProductApi: vi.fn(),
}));

vi.mock('@/services/productComments/api/mutations', () => ({
  createCommentApi: vi.fn(),
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

describe('useProductComments hooks', () => {
  const slug = 'test-product';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetComments', () => {
    it('should fetch comments when slug is provided', async () => {
      const mockComments = [{ id: 'c1', content: 'Great!', author: { name: 'User' } }];
      (queries.fetchCommentsByProductApi as any).mockResolvedValue(mockComments);

      const { result } = renderHook(() => useGetComments(slug), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockComments);
      expect(queries.fetchCommentsByProductApi).toHaveBeenCalledWith(slug);
    });

    it('should not fetch when slug is falsy', () => {
      renderHook(() => useGetComments(''), { wrapper: createWrapper() });
      expect(queries.fetchCommentsByProductApi).not.toHaveBeenCalled();
    });
  });

  describe('useCreateComment', () => {
    const input = {
      productSlug: slug,
      content: 'Very good product!',
      parentId: undefined,
    };
    const createdComment = { id: 'c1', ...input, authorId: 'u1' };

    it('should create comment and invalidate cache', async () => {
      (mutations.createCommentApi as any).mockResolvedValue(createdComment);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateComment(slug), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // فقط یک آرگومان (payload) ارسال می‌شود
      expect(mutations.createCommentApi).toHaveBeenCalledWith(input);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: productCommentKeys.byProduct(slug),
      });
    });
  });

  describe('useUpdateComment', () => {
    const id = 'c1';
    const data = { content: 'Updated content' };
    const updatedComment = { id, ...data, productSlug: slug };

    it('should update comment and invalidate cache', async () => {
      (mutations.updateCommentApi as any).mockResolvedValue(updatedComment);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateComment(slug), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate({ id, data });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mutations.updateCommentApi).toHaveBeenCalledWith(id, data);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: productCommentKeys.byProduct(slug),
      });
    });
  });

  describe('useDeleteComment', () => {
    const id = 'c1';

    it('should delete comment and invalidate cache', async () => {
      (mutations.deleteCommentApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteComment(slug), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(id);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // فقط یک آرگومان (id) ارسال می‌شود
      expect(mutations.deleteCommentApi).toHaveBeenCalledWith(id);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: productCommentKeys.byProduct(slug),
      });
    });
  });
});
