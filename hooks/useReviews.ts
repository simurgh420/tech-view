// hooks/useReviews.ts

import {
  createReviewApi,
  deleteReviewApi,
  updateReviewApi,
} from '@/services/reviews/api/mutations';
import { fetchReviewsByProduct } from '@/services/reviews/api/queries';

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
      mutationFn: (payload: ReviewPayload) => createReviewApi(payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', slug] }),
    });
  const useUpdateReview = (slug: string) =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ReviewPayload> }) =>
        updateReviewApi(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
      },
    });

  const useDeleteReview = () =>
    useMutation({
      mutationFn: (id: string) => deleteReviewApi(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', slug] }),
    });
  return {
    useGetReviews,
    useCreateReview,
    useUpdateReview,
    useDeleteReview,
  };
}
