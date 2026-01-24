// hooks/useReviews.ts

import {
  createReviewApi,
  deleteReviewApi,
  updateReviewApi,
} from '@/services/reviews/api/mutations';
import { fetchReviewsByProductApi } from '@/services/reviews/api/queries';

import { Review, ReviewPayload } from '@/types/review';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useReviews(slug: string) {
  const qc = useQueryClient();
  const useGetReviews = () =>
    useQuery<Review[]>({
      queryKey: ['reviews', slug],
      queryFn: () => fetchReviewsByProductApi(slug),
      enabled: !!slug,
    });
  const useCreateReview = () =>
    useMutation({
      mutationFn: (payload: ReviewPayload) => createReviewApi(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', slug] }),
    });
  const useUpdateReview = (slug: string) =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ReviewPayload> }) =>
        updateReviewApi(id, data),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['reviews', slug] });
      },
    });

  const useDeleteReview = () =>
    useMutation({
      mutationFn: (id: string) => deleteReviewApi(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', slug] }),
    });
  return {
    useGetReviews,
    useCreateReview,
    useUpdateReview,
    useDeleteReview,
  };
}
