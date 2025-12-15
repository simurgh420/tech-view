// services/comments/api/mutations.ts

import axios from 'axios';
import { CommentSafe } from '../db/queries';

export async function addComment(
  postId: string,
  newComment: {
    author: string;
    content: string;
    avatar?: string;
    rating: number;
  }
): Promise<CommentSafe> {
  const { data } = await axios.post(`/api/posts/${postId}/comments`, newComment);
  return data;
}

export async function likeCommentApi(commentId: string): Promise<CommentSafe> {
  const { data } = await axios.post(`/api/comments/${commentId}/dislike`);
  return data;
}
export async function dislikeCommentApi(commentId: string): Promise<CommentSafe> {
  const { data } = await axios.post(`/api/comments/${commentId}/dislike`);
  return data;
}
