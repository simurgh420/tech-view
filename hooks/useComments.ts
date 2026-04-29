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

export function useComments(postId: string) {
  const qc = useQueryClient();

  // دریافت کامنت‌ها
  const useGetComments = () =>
    useQuery<CommentSafe[]>({
      queryKey: ['comments', postId],
      queryFn: () => fetchCommentsApi(postId),
    });

  // ایجاد کامنت
  const useAddComment = () =>
    useMutation<CommentSafe, Error, CreateCommentInput>({
      mutationFn: data => addCommentApi(postId, data),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['comments', postId] });
      },
    });

  // ویرایش کامنت
  const useUpdateComment = () =>
    useMutation<CommentSafe, Error, { commentId: string; data: UpdateCommentInput }>({
      mutationFn: ({ commentId, data }) => updateCommentApi(commentId, data),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['comments', postId] });
      },
    });

  // حذف کامنت
  const useDeleteComment = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: commentId => deleteCommentApi(commentId),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['comments', postId] });
      },
    });

  return {
    useGetComments,
    useAddComment,
    useUpdateComment,
    useDeleteComment,
  };
}
