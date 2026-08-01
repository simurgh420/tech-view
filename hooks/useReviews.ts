// hooks/useReviews.ts
import { Review } from '@/app/generated/prisma/client';
import { CreateReviewInput, UpdateReviewInput } from '@/lib/validation/review';
import {
  createReviewApi,
  deleteReviewApi,
  updateReviewApi,
} from '@/services/reviews/api/mutations';
import { fetchAdminReviewsApi, fetchReviewsByProductApi } from '@/services/reviews/api/queries';
import { AdminReviewItem, ReviewWithAuthor } from '@/types/review';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** کلیدهای کوئری متمرکز برای reviews */
export const reviewKeys = {
  byProduct: (slug: string) => ['reviews', slug] as const,
};
export const adminReviewKeys = {
  all: ['admin-reviews'] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** دیدگاه‌های یک محصول بر اساس اسلاگ */
export function useGetReviews(slug: string) {
  return useQuery<ReviewWithAuthor[]>({
    queryKey: reviewKeys.byProduct(slug),
    queryFn: () => fetchReviewsByProductApi(slug),
    enabled: !!slug,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** ثبت دیدگاه جدید — slug برای invalidate کردن کش لازم است */
export function useCreateReview(slug: string) {
  const qc = useQueryClient();

  return useMutation<Review, Error, CreateReviewInput>({
    mutationFn: createReviewApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.byProduct(slug) });
    },
  });
}

/** ویرایش دیدگاه */
export function useUpdateReview(slug: string) {
  const qc = useQueryClient();

  return useMutation<Review, Error, { id: string; data: UpdateReviewInput }>({
    mutationFn: ({ id, data }) => updateReviewApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.byProduct(slug) });
    },
  });
}

/** حذف دیدگاه */
export function useDeleteReview(slug: string) {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteReviewApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.byProduct(slug) });
    },
  });
}
// بخش رویو ها برای  صفحه محصولات
export function useGetAdminReviews() {
  return useQuery<AdminReviewItem[]>({
    queryKey: adminReviewKeys.all,
    queryFn: fetchAdminReviewsApi,
  });
}
