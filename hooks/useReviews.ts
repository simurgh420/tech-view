// hooks/useReviews.ts

import { Review } from '@/app/generated/prisma/client';
import { CreateReviewInput, UpdateReviewInput } from '@/lib/validation/review';
import {
  createReviewApi,
  deleteReviewApi,
  updateReviewApi,
} from '@/services/reviews/api/mutations';
import { fetchReviewsByProductApi } from '@/services/reviews/api/queries';

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
    useMutation<Review, Error, CreateReviewInput>({
      mutationFn: createReviewApi,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', slug] }),
    });
  const useUpdateReview = () =>
    useMutation<Review, Error, { id: string; data: UpdateReviewInput }>({
      mutationFn: ({ id, data }) => updateReviewApi(id, data),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', slug] }),
    });

  const useDeleteReview = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: deleteReviewApi,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', slug] }),
    });
  return {
    useGetReviews,
    useCreateReview,
    useUpdateReview,
    useDeleteReview,
  };
}
