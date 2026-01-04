// hooks/useComments.ts
import {
  addCommentApi,
  deleteCommentApi,
  updateCommentApi,
} from '@/services/comments/api/mutations';
import { fetchComments } from '@/services/comments/api/queries';
import { CommentSafe } from '@/types/comment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useComments(postId: string) {
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery<CommentSafe[]>({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
  });

  const addComment = useMutation({
    mutationFn: (newComment: { authorId: string; content: string; rating: number }) =>
      addCommentApi(postId, newComment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });

  const updateComment = useMutation({
    mutationFn: (params: { commentId: string; data: { content?: string; rating?: number } }) =>
      updateCommentApi(params.commentId, params.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });

  return { comments, isLoading, error, addComment, updateComment, deleteComment };
}
