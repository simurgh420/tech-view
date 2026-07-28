// hooks/useProductComments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateProductCommentInput,
  UpdateProductCommentInput,
} from '@/lib/validation/productComment';
import {
  createCommentApi,
  deleteCommentApi,
  updateCommentApi,
} from '@/services/productComments/api/mutations';
import { fetchCommentsByProductApi } from '@/services/productComments/api/queries';
import { CommentNode } from '@/types/CommentProduct';

/** کلیدهای کوئری متمرکز برای دیدگاه‌های محصول */
export const productCommentKeys = {
  byProduct: (slug: string) => ['product-comments', slug] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** دیدگاه‌های یک محصول بر اساس اسلاگ */
export function useGetComments(slug: string) {
  return useQuery<CommentNode[]>({
    queryKey: productCommentKeys.byProduct(slug),
    queryFn: () => fetchCommentsByProductApi(slug),
    enabled: !!slug,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** ثبت دیدگاه جدید — slug برای invalidate کردن کش لازم است */
export function useCreateComment(slug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductCommentInput) => createCommentApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productCommentKeys.byProduct(slug) });
    },
  });
}

/** ویرایش دیدگاه */
export function useUpdateComment(slug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductCommentInput }) =>
      updateCommentApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productCommentKeys.byProduct(slug) });
    },
  });
}

/** حذف دیدگاه */
export function useDeleteComment(slug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCommentApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productCommentKeys.byProduct(slug) });
    },
  });
}
