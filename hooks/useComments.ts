// hooks/useComments.ts

import {
  addCommentApi,
  deleteCommentApi,
  dislikeCommentApi,
  likeCommentApi,
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
  const addCommentMutation = useMutation({
    mutationFn: (newComment: {
      author: string;
      content: string;
      avatar?: string;
      rating: number;
    }) => addCommentApi(postId, newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: error => {
      console.error('خطا در حذف کامنت:', error);
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: (params: {
      commentId: string;
      data: {
        author?: string;
        content?: string;
        avatar?: string;
      };
    }) => updateCommentApi(params.commentId, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: error => {
      console.error('خطا در ویرایش کامنت:', error);
    },
  });
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: error => {
      console.error('خطا در لایک کامنت:', error);
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
    updateComment: updateCommentMutation,
    deleteComment: deleteCommentMutation,
    likeComment: likeCommentMutation,
    dislikeComment: dislikeCommentMutation,
  };
}
