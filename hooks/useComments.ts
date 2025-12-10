import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useComments(postId: string) {
  const queryClient = useQueryClient();
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await axios.get(`/api/posts/${postId}/comments`);
      return res.data;
    },
  });
  const addComment = useMutation({
    mutationFn: async (newComment: {
      author: string;
      content: string;
      avatar?: string;
      rating: number;
    }) => {
      const res = await axios.post(`/api/posts/${postId}/comments`, newComment);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
  const likeComment = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await axios.post(`/api/comments/${commentId}/like`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
  const dislikeComment = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await axios.post(`/api/comments/${commentId}/dislike`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
  return { comments, isLoading, addComment, likeComment, dislikeComment };
}
