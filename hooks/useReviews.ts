// hooks/useReviews.ts

import { fetchReviewsByProduct } from '@/services/reviews/api/queries';
import { createReview, deleteReview, updateReview } from '@/services/reviews/db/mutations';
import { Review, ReviewPayload } from '@/types/review';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useReviews(slug: string) {
  const queryClient = useQueryClient();
  const useGetReviews = () =>
    useQuery<Review[]>({
      queryKey: ['reviews', slug],
      queryFn: () => fetchReviewsByProduct(slug),
      enabled: !!slug,
    });
  const useCreateReview = () =>
    useMutation({
      mutationFn: (payload: ReviewPayload) => createReview(payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', slug] }),
    });
  const useUpdateReview = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ReviewPayload> }) =>
        updateReview(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', slug] }),
    });

  const useDeleteReview = () =>
    useMutation({
      mutationFn: (id: string) => deleteReview(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', slug] }),
    });
  return {
    useGetReviews,
    useCreateReview,
    useUpdateReview,
    useDeleteReview,
  };
}
