// hooks/useComments.ts

import { addComment, dislikeCommentApi, likeCommentApi } from '@/services/comments/api/mutations';
import { fetchComments } from '@/services/comments/api/queries';
import { CommentSafe } from '@/services/comments/db/queries';
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
  const addCommentMutation = useMutation({
    mutationFn: (newComment: {
      author: string;
      content: string;
      avatar?: string;
      rating: number;
    }) => addComment(postId, newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: err => {
      console.error('خطا در افزودن کامنت:', err);
    },
  });
  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => likeCommentApi(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: err => {
      console.error('خطا در لایک کامنت:', err);
    },
  });
  const dislikeCommentMutation = useMutation({
    mutationFn: (commentId: string) => dislikeCommentApi(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: err => {
      console.error('خطا در دیسلایک کامنت:', err);
    },
  });
  return {
    comments,
    isLoading,
    error,
    addComment: addCommentMutation,
    likeComment: likeCommentMutation,
    dislikeComment: dislikeCommentMutation,
  };
}
