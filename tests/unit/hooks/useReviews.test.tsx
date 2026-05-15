// tests/unit/hooks/useReviews.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useReviews } from '@/hooks/useReviews';
import * as queries from '@/services/reviews/api/queries';
import * as mutations from '@/services/reviews/api/mutations';

vi.mock('@/services/reviews/api/queries', () => ({
  fetchReviewsByProductApi: vi.fn(),
}));

vi.mock('@/services/reviews/api/mutations', () => ({
  createReviewApi: vi.fn(),
  updateReviewApi: vi.fn(),
  deleteReviewApi: vi.fn(),
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

describe('useReviews', () => {
  const slug = 'test-product';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetReviews', () => {
    it('should fetch reviews when slug is provided', async () => {
      const mockReviews = [{ id: 'r1', rating: 5, content: 'Great!' }];
      (queries.fetchReviewsByProductApi as any).mockResolvedValue(mockReviews);
      const { result } = renderHook(() => useReviews(slug).useGetReviews(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockReviews);
      expect(queries.fetchReviewsByProductApi).toHaveBeenCalledWith(slug);
    });

    it('should not fetch when slug is falsy', () => {
      renderHook(() => useReviews('').useGetReviews(), { wrapper: createWrapper() });
      expect(queries.fetchReviewsByProductApi).not.toHaveBeenCalled();
    });
  });

  describe('useCreateReview', () => {
    const input = {
      productSlug: slug,
      rating: 5,
      content: 'Very good product!',
      title: 'Excellent',
    };
    const createdReview = { id: 'r1', ...input, authorId: 'u1' };

    it('should create review and invalidate cache', async () => {
      (mutations.createReviewApi as any).mockResolvedValue(createdReview);
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useReviews(slug).useCreateReview(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.createReviewApi).toHaveBeenCalledWith(input, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reviews', slug] });
    });
  });

  describe('useUpdateReview', () => {
    const id = 'r1';
    const data = { rating: 4, content: 'Updated content' };
    const updatedReview = { id, ...data, productSlug: slug };

    it('should update review and invalidate cache', async () => {
      (mutations.updateReviewApi as any).mockResolvedValue(updatedReview);
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useReviews(slug).useUpdateReview(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate({ id, data });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.updateReviewApi).toHaveBeenCalledWith(id, data);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reviews', slug] });
    });
  });

  describe('useDeleteReview', () => {
    const id = 'r1';

    it('should delete review and invalidate cache', async () => {
      (mutations.deleteReviewApi as any).mockResolvedValue({ success: true });
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useReviews(slug).useDeleteReview(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });
      result.current.mutate(id);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mutations.deleteReviewApi).toHaveBeenCalledWith(id, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reviews', slug] });
    });
  });
});
