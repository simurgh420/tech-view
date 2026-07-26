// hooks/useComments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CommentSafe } from '@/types/comment';
import { fetchCommentsApi } from '@/services/comments/api/queries';
import {
  addCommentApi,
  updateCommentApi,
  deleteCommentApi,
} from '@/services/comments/api/mutations';
import type { CreateCommentInput, UpdateCommentInput } from '@/lib/validation/comment';

/** کلیدهای کوئری متمرکز برای کامنت‌های پست */
export const commentKeys = {
  byPost: (postId: string) => ['comments', postId] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** کامنت‌های یک پست بر اساس شناسه */
export function useGetComments(postId: string) {
  return useQuery<CommentSafe[]>({
    queryKey: commentKeys.byPost(postId),
    queryFn: () => fetchCommentsApi(postId),
    enabled: !!postId,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** ثبت کامنت جدید — postId هم برای فراخوانی API و هم برای invalidate لازم است */
export function useAddComment(postId: string) {
  const qc = useQueryClient();

  return useMutation<CommentSafe, Error, CreateCommentInput>({
    mutationFn: data => addCommentApi(postId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.byPost(postId) });
    },
  });
}

/** ویرایش کامنت */
export function useUpdateComment(postId: string) {
  const qc = useQueryClient();

  return useMutation<CommentSafe, Error, { commentId: string; data: UpdateCommentInput }>({
    mutationFn: ({ commentId, data }) => updateCommentApi(commentId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.byPost(postId) });
    },
  });
}

/** حذف کامنت */
export function useDeleteComment(postId: string) {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: commentId => deleteCommentApi(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.byPost(postId) });
    },
  });
}
