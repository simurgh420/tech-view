// services/comments/api/queries.ts

import axios from 'axios';
import { CommentSafe } from '../db/queries';

export async function fetchComments(postId: string): Promise<CommentSafe[]> {
  const { data } = await axios.get<CommentSafe[]>(`/api/posts/${postId}/comments`);
  return data;
}
