'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllCommentsAdminApi } from '@/services/comments/api/queries';
import { deleteCommentApi } from '@/services/comments/api/mutations';
import { AdminComment } from '@/types/comment';

export function useAdminComments() {
  const qc = useQueryClient();

  const commentsQuery = useQuery<AdminComment[]>({
    queryKey: ['admin-comments'],
    queryFn: fetchAllCommentsAdminApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-comments'] });
    },
  });

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    deleteComment: deleteMutation,
  };
}
