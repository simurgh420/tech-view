// services/comments/api/mutations.ts

import { CommentSafe } from '@/types/comment';
import axios from 'axios';

export async function addCommentApi(
  postId: string,
  newComment: {
    author: string;
    content: string;
    avatar?: string | null;
    rating: number;
  }
): Promise<CommentSafe> {
  const { data } = await axios.post(`/api/posts/${postId}/comments`, newComment);
  return data;
}
export async function updateCommentApi(
  commentId: string,
  data: { content?: string; rating?: number; avatar?: string }
): Promise<CommentSafe> {
  const { data: res } = await axios.put(`/api/comments/${commentId}`, data);
  return res;
}
export async function deleteCommentApi(commentId: string): Promise<{ success: boolean }> {
  const { data } = await axios.delete(`/api/comments/${commentId}`);
  return data;
}
export async function likeCommentApi(commentId: string): Promise<CommentSafe> {
  const { data } = await axios.post(`/api/comments/${commentId}/like`);
  return data;
}
export async function unlikeCommentApi(commentId: string): Promise<CommentSafe> {
  const { data } = await axios.post(`/api/comments/${commentId}/unlike`);
  return data;
}
export async function dislikeCommentApi(commentId: string): Promise<CommentSafe> {
  const { data } = await axios.post(`/api/comments/${commentId}/dislike`);
  return data;
}

export async function undislikeCommentApi(commentId: string): Promise<CommentSafe> {
  const { data } = await axios.post(`/api/comments/${commentId}/undislike`);
  return data;
}
